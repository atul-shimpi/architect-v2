<?php

return [
    'groups' => [
        'users' => [
            'projects.create' => 1,
            'editors.enable' => 1,
            'plans.view' => 1,
            'templates.view' => 1,
        ]
    ],
    'all' => [
        'builder' => [
            [
                'name' => 'projects.publish',
                'description' => 'Allow user to publish projects to their own FTP server.'
            ],
            [
                'name' => 'editors.enable',
                'description' => 'Allow user to use html,css and js code editors.'
            ],
            [
                'name' => 'projects.download',
                'description' => 'Allow user to download their project .zip file.'
            ]
        ],

        'projects' => [
            ['name' => 'projects.view'],
            ['name' => 'projects.create'],
            ['name' => 'projects.update'],
            ['name' => 'projects.delete'],
        ],

        'plans' => [
            ['name' => 'plans.view'],
            ['name' => 'plans.create'],
            ['name' => 'plans.update'],
            ['name' => 'plans.delete'],
        ],
    ]
];
