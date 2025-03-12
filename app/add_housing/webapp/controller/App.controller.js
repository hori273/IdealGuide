sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/m/MessageToast"
], function (Controller, MessageToast) {
  "use strict";

  return Controller.extend("addhousing.controller.AddHousing", {
      onInit: function () {
          // Nothing to initialize for now
      },

      onFormSubmit: function () {
          const oView = this.getView();

          // Retrieve values from form
          const type = oView.byId("typeSelect").getSelectedKey();
          const name = oView.byId("nameInput").getValue();
          const email = oView.byId("emailInput").getValue();
          const phone = oView.byId("phoneInput").getValue();
          const address = oView.byId("addressInput").getValue();
          const currency = oView.byId("currencySelect").getSelectedKey();
          const stars = oView.byId("starsInput").getValue();
          const price = oView.byId("priceInput").getValue();
          const capacity = oView.byId("capacityInput").getValue();
          const description = oView.byId("descriptionInput").getValue();

          // Display form data in a message toast for now
          MessageToast.show(`Submitted:\n
              Type: ${type}\n
              Name: ${name}\n
              Email: ${email}\n
              Phone: ${phone}\n
              Address: ${address}\n
              Currency: ${currency}\n
              Stars: ${stars}\n
              Price: ${price}\n
              Capacity: ${capacity}\n
              Description: ${description}`);
      }
  });
});
