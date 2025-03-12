sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'seeyourhousing/test/integration/FirstJourney',
		'seeyourhousing/test/integration/pages/HOUSINGList',
		'seeyourhousing/test/integration/pages/HOUSINGObjectPage'
    ],
    function(JourneyRunner, opaJourney, HOUSINGList, HOUSINGObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('seeyourhousing') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onTheHOUSINGList: HOUSINGList,
					onTheHOUSINGObjectPage: HOUSINGObjectPage
                }
            },
            opaJourney.run
        );
    }
);