sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast"
], function (Controller, MessageToast) {
    "use strict";

    return Controller.extend("addhousing.controller.AddHousing", {
        onSubmit: async function () {
            const oView = this.getView();

            const sType          = oView.byId("typeSelect").getSelectedItem()?.getKey();
            const sName          = oView.byId("nameInput").getValue();
            const sEmail         = oView.byId("emailInput").getValue();
            const sPhone         = oView.byId("phoneInput").getValue();
            const sAddress       = oView.byId("address").getValue();
            const sCurrency      = oView.byId("currencySelect").getSelectedItem()?.getKey();
            const iStars         = oView.byId("starsIndicator").getValue();
            const iPricePerNight = oView.byId("priceInput").getValue();
            const iCapacity      = oView.byId("capacityInput").getValue();
            const sDescription   = oView.byId("description").getValue();
        
            // Get values of Total Capacity and Price Per Night fields
            const sTotalCapacity = oView.byId("capacityInput").getValue();
            const sPricePerNight = oView.byId("priceInput").getValue();
        
            // Regular expression to validate digits only
            const isValidNumber = /^[1-9]\d*$/;
        
            // Check for invalid characters in Price Per Night
            if (!isValidNumber.test(sPricePerNight)) {
                sap.m.MessageToast.show("Price Per Night must contain digits only.");
                oView.byId("priceInput").setValue("1"); // Reset the field
                return;
            }
        
            // Check for invalid characters in Total Capacity
            if (!isValidNumber.test(sTotalCapacity)) {
                sap.m.MessageToast.show("Total Capacity must contain digits only.");
                oView.byId("capacityInput").setValue("10"); // Reset the field
                return;
            }
    
                // Basic validation example
                if (!sType || !sName || !sEmail || !sPhone || !sAddress) {
                    MessageBox.error("Please fill in all required fields (Type, Name, Email, Phone, Address)!");
                    return;
                }
    
                const oModel = oView.getModel("catalog");
                console.log(oModel);
    
                const oInsertHousing = oModel.bindContext("/insertHousing(...)");
    
                // 4. Set each parameter expected by your backend function
                oInsertHousing.setParameter("type", sType);
                oInsertHousing.setParameter("name", sName);
                oInsertHousing.setParameter("email", sEmail);
                oInsertHousing.setParameter("phone", sPhone);
                oInsertHousing.setParameter("address", sAddress);
                oInsertHousing.setParameter("currency", sCurrency);
                oInsertHousing.setParameter("stars", parseInt(iStars, 10));
                oInsertHousing.setParameter("pricePerNight", parseInt(iPricePerNight, 10));
                oInsertHousing.setParameter("capacity", parseInt(iCapacity, 10));
                oInsertHousing.setParameter("description", sDescription);
    
                try {
                    // 5. Execute the call and handle response
                    await oInsertHousing.execute();
    
                    MessageToast.show("Housing inserted successfully!");
                    // Optionally, you could reset the fields or navigate back:
                    // oView.byId("typeSelect").setSelectedKey("");
                    // oView.byId("nameInput").setValue("");
                    // ...
    
                } catch (error) {
                    console.error("Error inserting housing:", error);
                }
            }
    
        });
});
