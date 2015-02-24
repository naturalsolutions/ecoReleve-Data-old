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
        	'validate/:type/:id/:ind_ind(/)' : 'validate_type_id',

            'export(/)' : 'export',

        	'import(/)' : 'import',
            'import/gsm(/)' : 'import_gsm',
            'import/rfid(/)' : 'import_rfid',


            'site(/)' : 'site',
            'site/deploy(/)' : 'site_deploy',
            'site/add(/)' : 'site_add',
            'site/create(/)' : 'site_create',
            'site/:id(/)' : 'site_detail',



            'demo_stepper(/)' : 'demo_stepper',
            'demo_grid(/)' : 'demo_grid',
            'demo_filter(/)' : 'demo_filter',
            'demo_map(/)' : 'demo_map',



            '*route(/:page)': 'login'
        }
    });
});
