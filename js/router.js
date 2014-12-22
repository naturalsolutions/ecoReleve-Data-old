define([
    'backbone',
    'marionette'
], function(Backbone, Marionette) {

    'use strict';

    return Backbone.Marionette.AppRouter.extend( {
        appRoutes: {
        	'validate(/)' : 'validate',
        	'validate/:type(/)' : 'validate_type',
        	'validate/:type/:id(/)' : 'validate_type_id',

            'export(/)' : 'export',

        	'import(/)' : 'import',
            'import/gsm(/)' : 'import_gsm',
            'import/rfid(/)' : 'import_rfid',


            'site(/)' : 'site',
            'site/:id(/)' : 'site_detail',
            'site/add(/)' : 'site_add',
            'site/deploy(/)' : 'site_deploy',


            'demo_stepper(/)' : 'demo_stepper',
            'demo_grid(/)' : 'demo_grid',
            'demo_filter(/)' : 'demo_filter',



            '*route(/:page)': 'login'
        }
    });
});
