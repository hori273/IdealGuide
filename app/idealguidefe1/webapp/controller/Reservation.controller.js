sap.ui.define([
    'sap/ui/core/mvc/Controller',
    'sap/ui/model/json/JSONModel',
    "sap/m/MessageToast"
], function (Controller, JSONModel, MessageToast) {
    "use strict";

    var iPrice;
    var sPlaceId;

    var PageController = Controller.extend("idealguidefe1.controller.Reservation", {

        onInit: function (oEvent) {

            // set explored app's demo model on this sample
            var oModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock/supplier.json"));
            this.getView().setModel(oModel);

            this.getView().bindElement("/SupplierCollection/0");

            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.getRoute("reservation").attachMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function (oEvent) {
            var oArgs = oEvent.getParameter("arguments");
            var sHousingId = oArgs.id;
            sPlaceId = sHousingId;
            iPrice = oArgs.price;

            MessageToast.show("Housing ID: " + sPlaceId + ", Price: " + iPrice);
        },

        calculateNights: function () {
            var oView = this.getView();
            var oCheckInDate = oView.byId("checkInDate").getDateValue();
            var oCheckOutDate = oView.byId("checkOutDate").getDateValue();
            var nrPersons = oView.byId("numberOfPeople").getValue();

            if (nrPersons <= 0) {
                MessageToast.show("Please insert a valid number of people");
                // Reset the checkout date to null
                oView.byId("numberOfPeople").setValue(1);
                // Exit the function to prevent further processing
                return;
            }

            var today = new Date();
            if (oCheckInDate < today) {
                MessageToast.show("Check-in date cannot be in the past. Setting it to tomorrow.");
                today.setDate(today.getDate() + 1); // Set check-in date to tomorrow
                oView.byId("checkInDate").setDateValue(today);
                oCheckInDate = today; // Update the check-in date variable
            }

            if (oCheckInDate && oCheckOutDate) {
                if (oCheckOutDate <= oCheckInDate) {
                    // If checkout date is not later than check-in date, show alert
                    MessageToast.show("Check-out date must be later than check-in date");
                    // Reset the checkout date to null
                    oView.byId("checkOutDate").setDateValue(null);
                    // Exit the function to prevent further processing
                    return;
                }

                var timeDiff = Math.abs(oCheckOutDate.getTime() - oCheckInDate.getTime());
                var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));

                var price = iPrice * nrPersons * diffDays;

                // Set the calculated number of nights to the view's model
                oView.getModel().setProperty("/numberOfNights", diffDays);
                oView.getModel().setProperty("/totalPrice", price);
            } else {
                // Set the number of nights to 0 if dates are not selected
                oView.getModel().setProperty("/numberOfNights", 0);
            }
        },

        async onFunctionCall() {
            var oModel = this.getView().getModel("catalog");
            var oInsertReserationHousing = oModel.bindContext("/insertReservationHousing(...)");

            var oView = this.getView();
            var nrPersons = oView.byId("numberOfPeople").getValue();
            var nrNights = oView.byId("numberOfNights").getValue();
            var price = oView.byId("totalPrice").getValue();

            oInsertReserationHousing.setParameter("placeId", sPlaceId);
            oInsertReserationHousing.setParameter("nrPersons", nrPersons);
            oInsertReserationHousing.setParameter("nrNights", nrNights);
            oInsertReserationHousing.setParameter("price", price);
            
            await oInsertReserationHousing.execute();
            /*var oResult = oGenerateTreeFunction.getBoundContext().getObject();
            if (oResult && oResult.value) {
                try {
                    console.log(JSON.parse(oResult.value));
                    this.oDocModel = JSON.parse(oResult.value);
                    this.getView().getModel("treeJSONModel").setData(this.oDocModel);
                } catch {
                    console.log("Unable to generate Tree!");
                }
            }*/
        },

        async onApplyFidelityBonus() {
            try {
                var oModel = this.getView().getModel("catalog");
                var oFidelityBonusFunction = oModel.bindContext("/fidelityBonus(...)");
        
                var sUserEmail = 'andrei.kalman@nttdata.com';
        
                oFidelityBonusFunction.setParameter("userEmail", sUserEmail);
                oFidelityBonusFunction.setParameter("placeId", sPlaceId);
        
                await oFidelityBonusFunction.execute();
        
                var oResult = oFidelityBonusFunction.getBoundContext().getObject();
                var fFidelityBonusMultiplier = parseFloat(oResult.value);;

                var oView = this.getView();
                var iTotalPrice = oView.byId("totalPrice").getValue();

                var iTotalPriceWithBonus = Math.round(iTotalPrice * fFidelityBonusMultiplier);

                var sMessage = "Fidelity bonus multiplier: " + fFidelityBonusMultiplier + "\n" +
                       "Total price with bonus: " + iTotalPriceWithBonus;
                MessageToast.show(sMessage);
        
                oView.getModel().setProperty("/totalPrice", iTotalPriceWithBonus);
            } catch (error) {
                console.error(error);
            }
        }
        
    });

    return PageController;

});