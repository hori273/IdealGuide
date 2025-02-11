sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	"myreservations/model/formatter",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox"
], (Controller, History, formatter, JSONModel, MessageBox) => {
	"use strict";

	return Controller.extend("myreservations.controller.Detail", {
		formatter:formatter,

		onInit() {
			const oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("detail").attachPatternMatched(this.onObjectMatched, this);

			const oViewModel = new JSONModel({
                placeId: ""
            });
            this.getView().setModel(oViewModel, "viewModel");
			
		},

		async onObjectMatched(oEvent) {
			//this.byId("rating").reset();
			this.getView().bindElement({
				path: "/" + window.decodeURIComponent(oEvent.getParameter("arguments").reservationPath),
			});
			const sPlaceId = oEvent.getParameter("arguments").placeId;

            // Set the placeId into the local viewModel
            const oViewModel = this.getView().getModel("viewModel");
            oViewModel.setProperty("/placeId", sPlaceId);
		},

		onNavBack() {
			const oHistory = History.getInstance();
			const sPreviousHash = oHistory.getPreviousHash();

			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				const oRouter = this.getOwnerComponent().getRouter();
				oRouter.navTo("reservations", {}, true);
			}
		},

		onDeleteReservation(oEvent) {
            const oButton = oEvent.getSource();
            const sPlaceId = oButton.getCustomData().find(data => data.getKey() === "reservationId").getValue();

            MessageBox.confirm(`Are you sure you want to cancel the reservation with ID: ${sPlaceId}?`, {
                actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                onClose: async (oAction) => {
                    if (oAction === MessageBox.Action.YES) {
                        await this._cancelReservation(sPlaceId);
                    }
                }
            });
        },

        async _cancelReservation(sPlaceId) {
            const oModel = this.getOwnerComponent().getModel("catalog");

            try {
                const oContext = oModel.bindContext("/cancelReservationHousing(...)");
                oContext.setParameter("placeId", sPlaceId);

                await oContext.execute();

                MessageBox.success(`Reservation for place ID: ${sPlaceId} has been successfully cancelled.`);
                
                // Reload reservations model to reflect changes
                await this.loadReservationsModel();
            } catch (error) {
                MessageBox.error(`Failed to cancel reservation: ${error.message}`);
                console.error("Error cancelling reservation:", error);
            }
        },

		loadReservationsModel: function() {
			location.reload();
		},

		async isFeedbackAvailable(id){
            const oModel = this.getOwnerComponent().getModel("catalog");

            try {
                const oContext = oModel.bindContext("/isHousingReservationRated(...)");
                oContext.setParameter("reservationId", id);

                await oContext.execute();
                const oResult = oContext.getBoundContext().getObject();

                return !oResult.value;
            } catch (error) {
                console.error("Error checking feedback availability:", error);
                return false;
            }
        },

        async isEditAvailable(id){
            const oModel = this.getOwnerComponent().getModel("catalog");

            try {
                const oContext = oModel.bindContext("/isHousingReservationRated(...)");
                oContext.setParameter("reservationId", id);

                await oContext.execute();
                const oResult = oContext.getBoundContext().getObject();

                return oResult.value;
            } catch (error) {
                console.error("Error checking feedback availability:", error);
                return false;
            }
        },

        onGoToFeedback: function () {
			// Get the router instance
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			const oModelData = this.getView().getObjectBinding().getBoundContext("").getObject()
			const sReservationId= oModelData.ID;
            var oViewModel = this.getView().getModel("viewModel");
            var sPlaceName = oViewModel.getProperty("/placeId");
			oRouter.navTo("givefeedback", { id: sReservationId, housingName: sPlaceName });
		},

        onGoToEditFeedback: function () {
			// Get the router instance
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			const oModelData = this.getView().getObjectBinding().getBoundContext("").getObject()
			const sReservationId= oModelData.ID;
            var oViewModel = this.getView().getModel("viewModel");
            var sPlaceName = oViewModel.getProperty("/placeId");
			oRouter.navTo("editfeedback", { id: sReservationId, housingName: sPlaceName });
		},

	});
});