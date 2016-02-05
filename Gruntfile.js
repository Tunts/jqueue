module.exports = function(grunt){

    grunt.initConfig({
        mocha_istanbul: {
            coverage_unit: {
                src: 'test',
                options: {
                    mask: '**/*.unit.js',
                    coverageFolder:'coverage-unit'
                }
            },
            coverage_integration: {
                src: 'test',
                options: {
                    mask: '**/*.integration.js',
                    coverageFolder:'coverage-integration'
                }
            }
        },
        mochaTest: {
            test: {
                options: {
                    reporter: 'spec',
                    captureFile: 'results.txt', // Optionally capture the reporter output to a file
                    quiet: false, // Optionally suppress output to standard out (defaults to false)
                    clearRequireCache: false // Optionally clear the require cache before running tests (defaults to false)
                },
                src: ['test/**/*.js']
            }
        },
        watch:{
            all:{
                files:['lib/**/*.js','test/**/*.js'],
                tasks:['mochaTest']
            }
        }
    });

    grunt.event.on('coverage', function(lcovFileContents, done){
        // Check below on the section "The coverage event"
        done();
    });

    grunt.loadNpmTasks('grunt-mocha-istanbul');
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('coverage-unit', ['mocha_istanbul:coverage_unit']);
    grunt.registerTask('coverage-integration', ['mocha_istanbul:coverage_integration']);

    grunt.registerTask('test-unit', ['mocha_istanbul:coverage_unit']);
    grunt.registerTask('test-integration', ['mocha_istanbul:coverage_integration']);
};