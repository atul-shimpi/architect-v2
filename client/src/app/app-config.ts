import {environment} from "../environments/environment";

export const appConfig = {
    environment: environment.production ? 'production' : 'dev',
    navbar: {
        defaultPosition: 'dashboard',
        dropdownItems: [
            {route: '/dashboard', name: 'Dashboard', icon: 'web-design-custom'},
        ]
    },
    admin: {
        pages: [
            {name: 'templates', icon: 'web-design-custom', route: 'templates', permission: 'templates.view'},
            {name: 'projects', icon: 'dashboard', route: 'projects', permission: 'projects.view'},
        ],
        settingsPages: [
            {name: 'builder', route: 'builder'},
        ],
        analytics: {
          stats: [
              {name: 'users', icon: 'people'},
              {name: 'projects', icon: 'dashboard'},
              {name: 'templates', icon: 'web-design-custom'},
              {name: 'pages', icon: 'insert-drive-file'},
          ]
        },
        ads: [
            {name: 'Slot #1', slot: 'ad_slot_1', description: 'This will appear at the top of user dashboard.'},
            {name: 'Slot #2', slot: 'ad_slot_2', description: 'This will appear at the bottom of user dashboard.'},
        ],
        appearance: {
            defaultRoute: 'dashboard',
            navigationRoutes: [
                'dashboard',
                'dashboard/projects/new',
                'builder',
            ],
            menus: {
                availableRoutes:  [
                    'dashboard',
                    'dashboard/projects/new',
                ],
                positions: [
                    'dashboard',
                    'admin'
                ]
            },
        }
    },
};