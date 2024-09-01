const SAMPLE_PRODUCT_ID = "8eead611-f2a1-4922-bbb0-3e8ba867ee3c";
const SAMPLE_PING_MESSAGE_ID = "ping";
const SAMPLE_PONG_MESSAGE_ID = "pong";
const SAMPLE_CHECK_MESSAGE_ID = "check";
const SAMPLE_RESULT_MESSAGE_ID = "check_result";

/**
 * キュー番号に基づいて $.state.sendQueue から send 先を取得して send する
 */
function sendByQueueNumber(number, id, value) {
  const target = $.state.sendQueue[number];
  // キューが失われている状態、不正なので終了
  if (!target) {
    $.log("Check/sendByQueueNumber: queue not found");
    return;
  }

  target.send(id, value);
}

/**
 * 所有状況を確認する
 * 購入したことがあっても返金済みであれば所有したことにはならない
 */
function isOwned(ownProducts, playerHandleId) {
  for (let i = 0; i < ownProducts.length; i++) {
    const product = ownProducts[i];
    // インタラクトした playerHandle で購入情報がある場合
    if (product.player?.id === playerHandleId) {
      // 返金数よりも購入数が上回っている場合は購入済みとみなす
      if (product.plusAmount - product.minusAmount > 0) {
        return true;
      }
      break;
    }
  }
  return false;
}

$.onStart(() => {
  $.state.queueNumber = 0;
  $.state.sendQueue = {};
});

$.onInteract((playerHandle) => {
  $.getOwnProducts(SAMPLE_PRODUCT_ID, playerHandle, JSON.stringify({queueNumber: -1, id: playerHandle.id}));
});

$.onGetOwnProducts((ownProducts, json, errorReason) => {
  // 具体的なエラー理由が渡されている場合はログを出して終了
  if (errorReason !== null) {
    $.log(`Check/getOwnProducts: error ${errorReason}`);
    return;
  }

  const param = JSON.parse(json);

  // 購入情報がなければ終了
  if (ownProducts.length === 0) {
    // Use アイテムからの問い合わせなら返信し、そうでなければログを出す
    if (param.queueNumber >= 0) {
      sendByQueueNumber(param.queueNumber, SAMPLE_RESULT_MESSAGE_ID, "");
    } else {
      $.log("Check/getOwnProducts: no purchase");
    }

    return;
  }

  // 購入確認
  let purchased = isOwned(ownProducts, param.id);

  // キューに積まれていた onGetOwnProducts だった場合、 send したアイテムに返す
  if (param.queueNumber >= 0) {
    sendByQueueNumber(param.queueNumber, SAMPLE_RESULT_MESSAGE_ID, purchased ? param.id : "");
    return;
  }

  // onInteract から onGetOwnProducts を実行している場合はログを出して終了
  $.log(`Check/onGetOwnProducts: ${purchased ? "purchased" : "not purchased"}`);
});

$.onReceive((id, value, sender) => {
  // アイテム実体確認のメッセージだったらメッセージを返す
  if (id === SAMPLE_PING_MESSAGE_ID) {
    sender.send(SAMPLE_PONG_MESSAGE_ID, "pong");
    return;
  }

  // 関係のないメッセージだったら終了
  if (id !== SAMPLE_CHECK_MESSAGE_ID) {
    return;
  }

  // 結果を返すための send 対象アイテムをキュー番号と紐つけておく
  const queue = $.state.sendQueue;
  queue[$.state.queueNumber] = sender;
  $.state.sendQueue = queue;
  
  $.getOwnProducts(SAMPLE_PRODUCT_ID, value, JSON.stringify({queueNumber: $.state.queueNumber, id: value.id}));

  $.state.queueNumber = $.state.queueNumber + 1;
});
