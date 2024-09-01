const SAMPLE_PRODUCT_ID = "ここに商品 ID を入れてください";
const SAMPLE_PING_MESSAGE_ID = "ping";
const SAMPLE_PONG_MESSAGE_ID = "pong";
const SAMPLE_CHECK_MESSAGE_ID = "check";
const SAMPLE_RESULT_MESSAGE_ID = "check_result";

/**
 * 近くのアイテムに投機的に send してメッセージを返してくれるアイテムを探す
 */
function pingCheckItem() {
  const items = $.getItemsNear($.getPosition(), 10);
  for (let i = 0; i < items.length; i++) {
    items[i].send(SAMPLE_PING_MESSAGE_ID, "ping");
  }
}

/**
 * 商品の効果を発動させる
 */
function applyProductEffect() {
  $.subNode("Text").setTextColor(Math.random(), Math.random(), Math.random(), 1);
}

$.onStart(() => {
  // 毎回購入情報を確認する待ち時間を減らすためにキャッシュする
  $.state.validateCache = [];
  $.state.checkItemCache = null;

　// 購入情報確認用アイテムの存在を確認する
  // worldItemReference ベータ抜けしてくれー！
  pingCheckItem();
});

$.onInteract((playerHandle) => {
  // 購入情報がキャッシュ済みであれば即座に効果を発動させる
  if ($.state.validateCache.indexOf(playerHandle.id) >= 0) {
    applyProductEffect();
    return;
  }

  // 購入情報確認用アイテムの存在が確認できていない場合はログを出して再確認して終了
  if (!$.state.checkItemCache) {
    $.log("Use/onInteract: not ready");
    pingCheckItem();
    return;
  }

  // 購入情報確認用アイテムに問い合わせる
  $.state.checkItemCache.send(SAMPLE_CHECK_MESSAGE_ID, playerHandle);
});

$.onReceive((id, purchasedPlayerId, sender) => {
  // アイテム実体確認のメッセージが返ってきたらキャッシュする
  // worldItemReference ベータ抜けしてくれー！
  if (id === SAMPLE_PONG_MESSAGE_ID) {
    $.state.checkItemCache = sender;
    return;
  }

  // 関係ないメッセージだったら捨てる
  if (id !== SAMPLE_RESULT_MESSAGE_ID) {
    return;
  }

  // 購入していなければログを出して終了
  if (purchasedPlayerId === "") {
    $.log("Use/onReceive: not purchased");
    return;
  }

  // 購入済みであることをキャッシュする
  // 今回のサンプルではワールドにいる最中に返金された場合を考慮しない
  const cache = $.state.validateCache;
  cache.push(purchasedPlayerId);
  $.state.validateCache = cache;

  if (!$.state.checkItemCache) {
    $.state.checkItemCache = sender;
  }

  applyProductEffect();
});

