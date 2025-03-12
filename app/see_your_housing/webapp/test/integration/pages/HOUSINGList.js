sap.ui.define(['sap/fe/test/ListReport'], function(ListReport) {
    'use strict';

    var CustomPageDefinitions = {
        actions: {
            applyEmailFilter: function(email) {
                return {
                    execute: function() {
                        var oTable = this.getView().byId("HOUSINGList");
                        var oBinding = oTable.getBinding("items");
                        var oFilter = new sap.ui.model.Filter("Email", sap.ui.model.FilterOperator.EQ, email);
                        oBinding.filter([oFilter]);
                    }
                };
            }
        },
        assertions: {}
    };

    var oCustomPage = new CustomPageDefinitions();
    oCustomPage.actions.applyEmailFilter("hotel1@gmail.com").execute();

    return new ListReport(
        {
            appId: 'seeyourhousing',
            componentId: 'MYHOUSINGList',
            contextPath: '/MYHOUSING'
        },
        CustomPageDefinitions
    );
});