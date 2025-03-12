using CatalogService as service from '../../srv/datamodel_srv';
annotate service.MYHOUSING with @(
    UI.FieldGroup #GeneratedGroup : {
        $Type : 'UI.FieldGroupType',
        Data : [
            {
                $Type : 'UI.DataField',
                Label : 'TYPE',
                Value : TYPE,
            },
            {
                $Type : 'UI.DataField',
                Label : 'NAME',
                Value : NAME,
            },
            {
                $Type : 'UI.DataField',
                Label : 'EMAIL',
                Value : EMAIL,
            },
            {
                $Type : 'UI.DataField',
                Label : 'PHONE',
                Value : PHONE,
            },
            {
                $Type : 'UI.DataField',
                Label : 'ADDRESS',
                Value : ADDRESS,
            },
            {
                $Type : 'UI.DataField',
                Label : 'PREFCURRENCY',
                Value : PREFCURRENCY,
            },
            {
                $Type : 'UI.DataField',
                Label : 'STARS',
                Value : STARS,
            },
            {
                $Type : 'UI.DataField',
                Label : 'PRICE_PER_NIGHT',
                Value : PRICE_PER_NIGHT,
            },
            {
                $Type : 'UI.DataField',
                Label : 'TOTAL_CAPACITY',
                Value : TOTAL_CAPACITY,
            },
            {
                $Type : 'UI.DataField',
                Label : 'DESCRIPTION',
                Value : DESCRIPTION,
            },
        ],
    },
    UI.Facets : [
        {
            $Type : 'UI.ReferenceFacet',
            ID : 'GeneratedFacet1',
            Label : 'General Information',
            Target : '@UI.FieldGroup#GeneratedGroup',
        },
    ],
    UI.LineItem : [
        {
            $Type : 'UI.DataField',
            Label : 'TYPE',
            Value : TYPE,
        },
        {
            $Type : 'UI.DataField',
            Label : 'NAME',
            Value : NAME,
        },
        {
            $Type : 'UI.DataField',
            Label : 'EMAIL',
            Value : EMAIL,
        },
        {
            $Type : 'UI.DataField',
            Label : 'PHONE',
            Value : PHONE,
        },
        {
            $Type : 'UI.DataField',
            Label : 'ADDRESS',
            Value : ADDRESS,
        },
    ],
);

