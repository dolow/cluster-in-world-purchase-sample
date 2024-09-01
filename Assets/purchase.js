const SAMPLE_PRODUCT_ID = "8eead611-f2a1-4922-bbb0-3e8ba867ee3c";
const SAMPLE_PURCHASE_META = "purchase_sample";

$.onInteract((playerHandle) => {
  // 今回のサンプルでは何回でも買えるようにしている
  playerHandle.requestPurchase(SAMPLE_PRODUCT_ID, SAMPLE_PURCHASE_META);
});

$.onRequestPurchaseStatus((meta, status, errorReason, player) => {
  // 購入成功
  if (status === PurchaseRequestStatus.Purchased) {
    $.log("Purchase/requestPurchase: succeeded");

    // 指定していないメタデータの場合、意図通りの購入処理ではないためログを出しておく
    if (meta !== SAMPLE_PURCHASE_META) {
      $.log(`Purchase/requestPurchase: unknwon meta "${meta}"`);
    }
    return;
  }

  // 具体的なエラー理由が渡されている場合はログを出して終了
  if (errorReason !== null) {
    $.log(`Purchase/requestPurchase: error ${errorReason}`);
    return;
  }

  // それ以外の場合はステータスがわかるログを出して終了
  // Busy や UserCanceled は復帰可能
  switch (status) {
    case PurchaseRequestStatus.Busy:         $.log("Purchase/requestPurchase: Busy");         break;
    case PurchaseRequestStatus.Failed:       $.log("Purchase/requestPurchase: Failed");       break;
    case PurchaseRequestStatus.NotAvailable: $.log("Purchase/requestPurchase: NotAvailable"); break;
    case PurchaseRequestStatus.Unknown:      $.log("Purchase/requestPurchase: Unknown");      break;
    case PurchaseRequestStatus.UserCanceled: $.log("Purchase/requestPurchase: UserCanceled"); break;
  }
});

