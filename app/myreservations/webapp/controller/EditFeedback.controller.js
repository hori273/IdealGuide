sap.ui.define([
    'sap/ui/core/mvc/Controller',
    'sap/ui/model/json/JSONModel',
    "sap/m/MessageToast",
    "sap/m/MessageBox",
], function (Controller, JSONModel, MessageToast, MessageBox) {
    "use strict";

    var id;
    var name;

    var PageController = Controller.extend("myreservations.controller.EditFeedback", {

        onInit: function (oEvent) {

            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.getRoute("editfeedback").attachMatched(this._onRouteMatched, this);
        },

        async _onRouteMatched(oEvent) {
            var oArgs = oEvent.getParameter("arguments");
            var sHousingId = oArgs.id;
            id = sHousingId;
            name = oArgs.housingName;
            //MessageToast.show("Reservation: " + id + ", at: " + name);

            await this._loadFeedback(sHousingId);
        },

        _loadFeedback: async function (reservationId) {
            try {
                var oModel = this.getView().getModel("catalog");
                var oContext = oModel.bindContext("/getHousingFeedback(...)");
                oContext.setParameter("reservationId", reservationId);

                await oContext.execute();
                
                console.log(reservationId);
                var result = oContext.getBoundContext().getObject();
                var aFeedback = result.value[0];

                if (aFeedback) {
                    this.getView().byId("rating").setValue(aFeedback.RATING);
                    this.getView().byId("feedbackTextArea").setValue(aFeedback.DESCRIPTION);
                } else {
                    MessageToast.show("No feedback found for this reservation.");
                }
            } catch (error) {
                MessageToast.show("Error fetching feedback.");
                console.error("Error loading feedback:", error);
            }
        },

        onNavBack: function () {
            var oHistory = sap.ui.core.routing.History.getInstance();
            var sPreviousHash = oHistory.getPreviousHash();
            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("reservations", {}, true);
            }
        },

        async onSubmitFeedback () {
            var iRating = this.getView().byId("rating").getValue();
            
            var sFeedback = this.getView().byId("feedbackTextArea").getValue();

            if (!iRating) {
                MessageBox.error("Please provide a rating before submitting.");
                return;
            }
            if (!sFeedback) {
                MessageBox.error("Please write some feedback before submitting.");
                return;
            }
            
            var oModel = this.getView().getModel("catalog");
            var oInsertFeedback = oModel.bindContext("/editHousingFeedback(...)");

            oInsertFeedback.setParameter("rating",iRating);
            oInsertFeedback.setParameter("description",sFeedback);
            oInsertFeedback.setParameter("reservationId",id);

            try {
                await oInsertFeedback.execute();
                MessageBox.success("Thank you for your feedback! You rated: " + iRating + " stars and wrote: " + sFeedback);

                this.onNavBack();
            
            } catch (error) {
                MessageToast.show("Failed to submit feedback. Please try again.");
                console.error("Error submitting feedback:", error);
            }
        },
        
    });

    return PageController;

});