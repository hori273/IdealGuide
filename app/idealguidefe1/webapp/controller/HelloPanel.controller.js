sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/ActionSheet",
    "sap/ui/core/HTML"
], function (Controller, MessageToast, HTML) {
    "use strict";

    return Controller.extend("idealguidefe1.controller.HelloPanel", {
        onInit: function () {
            this._fetchAddresses();
        },

        onShowHello: function () {
            const oModel = this.getView().getModel("tutorialModel");
            const sRecipientName = oModel.getProperty("/recipient/name") || "Despre Medias";

            const sPrompt = `${sRecipientName}`;

            $.getJSON("config.json")
                .done((config) => {
                    const sApiKey = config.OPENAI_API_KEY;

                    const oData = {
                        model: "gpt-4o-mini", //3.5-turbo
                        messages: [
                            { role: "user", content: sPrompt }
                        ]
                    };

                    $.ajax({
                        url: "https://api.openai.com/v1/chat/completions",
                        method: "POST",
                        contentType: "application/json",
                        headers: {
                            "Authorization": `Bearer ${sApiKey}`
                        },
                        data: JSON.stringify(oData),
                        success: function (oResponse) {
                            const sResponseText = oResponse.choices && oResponse.choices[0].message.content;
                            MessageToast.show(sResponseText || "No response received");
                        },
                        error: function (err) {
                            console.error(err);
                            MessageToast.show("Error calling OpenAI API");
                        }
                    });
                });
        },

        onOpenDialog: function () {
            this.pDialog ??= this.loadFragment({
                name: "idealguidefe1.view.HelloDialog"
            });

            this.pDialog.then((oDialog) => oDialog.open());
        },

        onCloseDialog: function () {
            this.byId("helloDialog").close();
        },

        async _fetchAddresses() {
            try {
                var oModel = this.getOwnerComponent().getModel("catalog");
                var oGetAddresses = oModel.bindContext("/getHousingAddresses(...)");
                await oGetAddresses.execute();
                var oResult = oGetAddresses.getBoundContext().getObject();
                const data = await oResult;
                const addresses = JSON.parse(data.value);
                return addresses;
            } catch (error) {
                console.error("Error fetching addresses:", error);
                return [];
            }
        },

        async _fetchRecommendedHousingDetails() {
            try {
                var oModel = this.getOwnerComponent().getModel("catalog");
                var oGetRecommended = oModel.bindContext("/getRecommendedForUser(...)");
                /*oGetRecommended.setParameter("userEmail", 'andrei.kalman@nttdata.com');
                oGetRecommended.setParameter("iTotalNumber", 3);*/
                await oGetRecommended.execute();
                var oResult = oGetRecommended.getBoundContext().getObject();
                const recommendedHousings = JSON.parse(oResult.value);

                const housingDetails = recommendedHousings.map(housing => ({
                    name: housing.NAME,
                    address: housing.ADDRESS
                }));

                return housingDetails;
            } catch (error) {
                console.error("Error fetching recommended housings:", error);
                return [];
            }
        },

        onShowMap: function () {
            const sGoogleMapsApiKey = "AIzaSyBpjxkuKN-6F0ULOG6gt34iXiQoWpmZfpA";
            const sScriptUrl = `https://maps.googleapis.com/maps/api/js?key=${sGoogleMapsApiKey}&callback=initMap&libraries=marker,places`;

            const oView = this.getView();
            let oHtmlControl = oView.byId("mapContainer");

            if (!oHtmlControl) {
                console.error("Map container not found!");
                MessageToast.show("Error: Map container not found.");
                return;
            }

            oHtmlControl.setContent(`
                <div id='map' style='width: 100%; height: 400px;'></div>
                <input id='pac-input' class='controls' type='text' placeholder='Search Box' style='box-sizing: border-box; 
                border: 1px solid transparent; width: 240px; height: 32px; margin-top: 10px; padding: 0 12px; border-radius: 3px; 
                font-size: 14px; outline: none; text-overflow: ellipsis; position: absolute; top: 10px; left: 50%; 
                transform: translateX(-50%); z-index: 5;'>
            `);

            if (!window.google || !window.google.maps) {
                const script = document.createElement("script");
                script.src = sScriptUrl;
                script.defer = true;
                script.async = true;
                script.onload = this.geocodeCenterAddress.bind(this);
                document.head.appendChild(script);
            } else {
                this.geocodeCenterAddress();
            }
        },

        geocodeCenterAddress: function () {
            const centerAddress = "Strada Lucian Blaga, Mediaș, Romania";

            const geocoder = new google.maps.Geocoder();
            geocoder.geocode({ address: centerAddress }, (results, status) => {
                if (status === "OK") {
                    this.initMap(results[0].geometry.location);
                } else {
                    console.error("Geocoding failed for center address: " + status);
                    MessageToast.show("Error: Could not find center location - " + centerAddress);
                }
            });
        },

        initMap: async function (centerLocation) {
            const mapDiv = document.getElementById("map");
            if (!mapDiv) {
                console.error("Map div not found in DOM!");
                MessageToast.show("Error: Map div not found.");
                return;
            }
        
            const map = new google.maps.Map(mapDiv, {
                center: centerLocation,
                zoom: 15,
                mapId: "8b7beeb0672f5679"
            });
        
            const input = document.getElementById("pac-input");
            const searchBox = new google.maps.places.SearchBox(input);
            map.controls[google.maps.ControlPosition.TOP_CENTER].push(input);
        
            map.addListener("bounds_changed", () => {
                searchBox.setBounds(map.getBounds());
            });
        
            searchBox.addListener("places_changed", () => {
                const places = searchBox.getPlaces();
        
                if (places.length == 0) {
                    return;
                }
        
                const bounds = new google.maps.LatLngBounds();
                places.forEach((place) => {
                    if (!place.geometry || !place.geometry.location) {
                        console.log("Returned place contains no geometry");
                        return;
                    }
        
                    new google.maps.Marker({
                        map,
                        icon: {
                            url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
                            scaledSize: new google.maps.Size(48, 48) 
                        },
                        title: place.name,
                        position: place.geometry.location
                    });
        
                    if (place.geometry.viewport) {
                        bounds.union(place.geometry.viewport);
                    } else {
                        bounds.extend(place.geometry.location);
                    }
                });
                map.fitBounds(bounds);
                input.value = '';
            });
        
            const addresses = await this._fetchAddresses();
            const recommendedHousingDetails = await this._fetchRecommendedHousingDetails();
        
            const geocoder = new google.maps.Geocoder();
        
            const oModel = this.getOwnerComponent().getModel("catalog");
            const oGetPreferredHousing = oModel.bindContext("/getPreferredHousingAddress(...)");
            oGetPreferredHousing.setParameter("userEmail", 'andrei.kalman@nttdata.com');
            await oGetPreferredHousing.execute();
            const oPreferredHousingResult = oGetPreferredHousing.getBoundContext().getObject();
            const preferredHousing = JSON.parse(oPreferredHousingResult.value);
        
            for (const address of addresses) {
                geocoder.geocode({ address: address.address }, (results, status) => {
                    if (status === "OK") {
                        const isPreferred = address.address === preferredHousing.address;
                        const isRecommended = recommendedHousingDetails.some(housing => housing.address === address.address)
                        let iconUrl;
                        if (isPreferred) {
                            iconUrl = "./images/star.png";
                        } else if (isRecommended) {
                            iconUrl = "./images/recommended.png";
                        } else {
                            iconUrl = undefined; 
                        }
                        const marker = new google.maps.Marker({
                            position: results[0].geometry.location,
                            map: map,
                            title: `Name: ${address.name}\nAddress: ${address.address}`,
                            icon: iconUrl ? {
                                url: iconUrl,
                                scaledSize: new google.maps.Size(48, 48) 
                            } : undefined
                        });
        
                        marker.addListener('click', () => {
                            const lat = results[0].geometry.location.lat();
                            const lng = results[0].geometry.location.lng();
                            const encodedAddress = encodeURIComponent(address.address);
                        
                            if (!this._oLocationDialog) {
                                this._oLocationDialog = new sap.m.Dialog({
                                    title: "Select Action",
                                    content: [],
                                    beginButton: new sap.m.Button({
                                        text: "Close",
                                        press: function () {
                                            this.getParent().close(); // Close dialog
                                        }
                                    })
                                });
                        
                                this.getView().addDependent(this._oLocationDialog);
                            }
                        
                            this._oLocationDialog.removeAllContent();
                        
                            const oWazeButton = new sap.m.Button({
                                text: "Directions with Waze",
                                icon: "sap-icon://car-rental",
                                press: () => {
                                    window.open(`https://www.waze.com/ul?ll=${lat},${lng}&navigate=yes`, "_blank");
                                }
                            });
                        
                            const oGoogleMapsButton = new sap.m.Button({
                                text: "Directions with Google Maps",
                                icon: "sap-icon://map",
                                press: () => {
                                    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, "_blank");
                                }
                            });
                        
                            const oDetailPageButton = new sap.m.Button({
                                text: "Go to Detail Page",
                                icon: "sap-icon://navigation-right-arrow",
                                press: () => {
                                    const oRouter = this.getOwnerComponent().getRouter();
                                    oRouter.navTo("detail", {
                                        housingPath: window.encodeURIComponent(`HOUSING(${address.id})`)
                                    });
                                }
                            });
                        
                            this._oLocationDialog.addContent(oWazeButton);
                            this._oLocationDialog.addContent(oGoogleMapsButton);
                            this._oLocationDialog.addContent(oDetailPageButton);
                        
                            this._oLocationDialog.open();
                        });                        
                        
                } else {
                        console.error("Geocoding failed for " + address.address + ": " + status);
                        MessageToast.show("Error: Could not find location - " + address.address);
                    }
                });
            }
        }
    });
});
