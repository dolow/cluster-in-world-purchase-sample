const SAMPLE_PRODUCT_ID = "ここに商品 ID を入れてください";
const SAMPLE_PURCHASE_META = "purchase_sample";

$.onInteract((playerHandle) => {
  // 今回のサンプルでは何回でも買えるようにしている
  playerHandle.requestPurchase(SAMPLE_PRODUCT_ID, SAMPLE_PURCHASE_META);
});

$.onRequestPurchaseStatus((meta, status, errorReason, player) => {
  // 購入成功した時
  if (status === PurchaseRequestStatus.Purchased) {
    $.log("Purchase/requestPurchase: succeeded");
    return;
  }

  // エラーが起こった時
  if (errorReason !== null) {
    $.log(`Purchase/requestPurchase: error ${errorReason}`);
    return;
  }

  // エラーじゃないけど何か問題がある時
  switch (status) {
    case PurchaseRequestStatus.Busy:         $.log("Purchase/requestPurchase: Busy");         break;
    case PurchaseRequestStatus.Failed:       $.log("Purchase/requestPurchase: Failed");       break;
    case PurchaseRequestStatus.NotAvailable: $.log("Purchase/requestPurchase: NotAvailable"); break;
    case PurchaseRequestStatus.Unknown:      $.log("Purchase/requestPurchase: Unknown");      break;
    case PurchaseRequestStatus.UserCanceled: $.log("Purchase/requestPurchase: UserCanceled"); break;
  }
});

