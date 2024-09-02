const SAMPLE_PRODUCT_ID = "ここに商品 ID を入れてください";
const TEXT_SUBNODE_NAME = "Text";

/**
 * 商品の効果を発動させる
 */
function applyProductEffect() {
  $.subNode(TEXT_SUBNODE_NAME).setTextColor(Math.random(), Math.random(), Math.random(), 1);
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
  // 毎回購入情報を確認する待ち時間を減らすためにキャッシュする
  $.state.validateCache = [];
});

$.onInteract((playerHandle) => {
  // 購入情報がキャッシュ済みであれば即座に効果を発動させる
  if ($.state.validateCache.indexOf(playerHandle.id) >= 0) {
    applyProductEffect();
    return;
  }

  $.getOwnProducts(SAMPLE_PRODUCT_ID, playerHandle, playerHandle.id);
});

$.onGetOwnProducts((ownProducts, playerHandleId, errorReason) => {
  // エラーが起こった時
  if (errorReason !== null) {
    $.log(`Use/onGetOwnProducts: error ${errorReason}`);
    return;
  }

  // 購入情報がない時
  if (ownProducts.length === 0) {
    return;
  }

  // 購入情報があるけど購入していない時
  if (!isOwned(ownProducts, playerHandleId)) {
    return;
  }

  // 購入済みの時
  // 購入済みユーザーをキャッシュする
  // 今回のサンプルではワールドにいる最中に返金された場合を考慮しない
  const cache = $.state.validateCache;
  cache.push(playerHandleId);
  $.state.validateCache = cache;

  applyProductEffect();
});
