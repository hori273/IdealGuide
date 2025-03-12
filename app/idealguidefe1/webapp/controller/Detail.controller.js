sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	"sap/m/MessageToast",
	"sap/m/Image",
	"sap/ui/model/json/JSONModel"
], (Controller, History, MessageToast, Image, JSONModel) => {
	"use strict";

	return Controller.extend("idealguidefe1.controller.Detail", {
		onInit() {
			const oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("detail").attachPatternMatched(this.onObjectMatched, this);

			const oViewModel = new JSONModel({
                averageRating: 0,
				feedbackNumber: 0
            });
            this.getView().setModel(oViewModel, "viewModel");
		},

		async onObjectMatched(oEvent) {
			//this.byId("rating").reset();
			this.getView().bindElement({
				path: "/" + window.decodeURIComponent(oEvent.getParameter("arguments").housingPath),
			});

			var sHousingId = '37DE1000-DB99-42BE-1800-91FA0E1991E0';
			/*const oModelData = this.getView().getObjectBinding().getBoundContext("").getObject()
			const sHousingId = oModelData.ID;
			console.log(sHousingId);*/

			await this._fetchFeedbacksAverageByHousingId(sHousingId);

			const aImages = await this._fetchImagesByHousingId(sHousingId);
			console.log(aImages);
			this._updateImageCarousel(aImages);
		},

		async _fetchFeedbacksAverageByHousingId(sHousingId){
			var oModel = this.getView().getModel("catalog");
			var getAverage = oModel.bindContext("/getFeedbackRatingForHousing(...)");

			var id = sHousingId;

			getAverage.setParameter("placeId", id);

			await getAverage.execute();
			var result = getAverage.getBoundContext().getObject();
			
			var oViewModel = this.getView().getModel("viewModel");
            oViewModel.setProperty("/averageRating", result.value);

			var getNumber = oModel.bindContext("/getNumberOfFeedbackForHousing(...)");
			getNumber.setParameter("placeId", id);

			await getNumber.execute();
			var result2 = getNumber.getBoundContext().getObject();
			oViewModel.setProperty("/feedbackNumber", result2.value);
		},

		async _fetchImagesByHousingId(sHousingId) {
			var oModel = this.getView().getModel("catalog");
			var getPhotos = oModel.bindContext("/getImagesByHousingId(...)");

			var id = sHousingId;

			getPhotos.setParameter("id", id);

			await getPhotos.execute();
			var result = getPhotos.getBoundContext().getObject();
			console.log(result);
			return result.value;

			// MessageToast.show("Failed to get images. Please try again.");
			// console.error("Error getting images:", error);

		},

		_updateImageCarousel(aImages) {
			const oCarousel = this.byId("imageCarousel");
			oCarousel.removeAllPages();

			/*aImages.foreach((oImage) => {
				const oImageControl = new Image({
					src: oImage.IMAGE 
				});
				oCarousel.addPage(oImageControl);
			});*/

			for (var i = 0; i < aImages.length; i++) {
				const oImageControl = new Image({
					src: "./images/" + aImages[i].IMAGE
				});
				oCarousel.addPage(oImageControl);
			}
		},

		onNavBack() {
			const oHistory = History.getInstance();
			const sPreviousHash = oHistory.getPreviousHash();

			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				const oRouter = this.getOwnerComponent().getRouter();
				oRouter.navTo("overview", {}, true);
			}
		},

		/*onRatingChange(oEvent) {
			const fValue = oEvent.getParameter("value");
			const oResourceBundle = this.getView().getModel("i18n").getResourceBundle();

			MessageToast.show(oResourceBundle.getText("ratingConfirmation", [fValue]));
		},*/

		onGoToReservation: function () {
			// Get the router instance
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			const oModelData = this.getView().getObjectBinding().getBoundContext("").getObject()
			const iPrice = oModelData.PRICE_PER_NIGHT;
			const sHousingId = oModelData.ID;
			oRouter.navTo("reservation", { id: sHousingId, price: iPrice });
		},

		onGoToFeedbacks: function () {
			// Get the router instance
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			const oModelData = this.getView().getObjectBinding().getBoundContext("").getObject();
			const sHousingId = oModelData.ID;
			oRouter.navTo("feedbacks", { id: sHousingId});
		}
	});
});