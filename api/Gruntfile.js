'use strict';
module.exports = function (grunt) {

    var optsDebug = {
        webPort: '8080',
        dgbPort: '9000'
    };

    grunt.initConfig({
        open : {
            debug : {
                path: 'http://localhost:' + optsDebug.webPort + '/debug?port=' + optsDebug.dgbPort,
                app: 'google-chrome'
            }
        },
        nodemon: {
            dev: {
                script: './bin/www',
                options: {
                    env: {
                        'NODE_ENV': 'development'
                    }
                }
            },
            inspect: {
                script: './bin/www',
                options: {
                    nodeArgs: ['--inspect=0.0.0.0:' + optsDebug.dgbPort],
                    env: {
                        'NODE_ENV': 'development'
                    }
                }
            },
            inspect_break: {
                script: './bin/www',
                options: {
                    nodeArgs: ['--inspect-brk=0.0.0.0' + optsDebug.dgbPort],
                    env: {
                        'NODE_ENV': 'development'
                    }
                }
            }
        },
        concurrent: {
            inspect: {
                tasks: ['nodemon:inspect', 'open:debug'],
                options: {
                    logConcurrentOutput: true
                }
            },
            inspect_break: {
                tasks: ['nodemon:inspect_break', 'open:debug'],
                options: {
                    logConcurrentOutput: true
                }
            }
        }
    });

    // Load plugins
    // grunt.loadNpmTasks('grunt-lab');
    grunt.loadNpmTasks('grunt-nodemon');
    grunt.loadNpmTasks('grunt-open');
    grunt.loadNpmTasks('grunt-concurrent');

    // Register tasks
    grunt.registerTask('default', ['nodemon:inspect']);
    grunt.registerTask('nodemonTask', ['nodemon:dev']);
    //grunt.registerTask('labTask', ['lab']);
    grunt.registerTask('dbg', function (type) {
        var taskType = type === 'break' ? 'inspect_break' : 'inspect';

        grunt.util.spawn({
            cmd: 'node-inspector',
            args: ['--web-port=' + optsDebug.webPort, '--debug-port=' + optsDebug.dgbPort, '--save-live-edit=true']
        }, function (error, result, code) {
            if (error) {
                grunt.log.error(error);
            }
        });
        var dbgUrl = '[node-inspector] Debug running at http://localhost:' + optsDebug.webPort + '/debug?port=' + optsDebug.dgbPort;
        grunt.log.writeln(dbgUrl.green);

        grunt.task.run(['concurrent:' + taskType]);
    });
};
