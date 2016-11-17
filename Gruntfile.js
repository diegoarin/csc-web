module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
    		pkg: grunt.file.readJSON('package.json'),
		concat: {
	    		options: {
        			separator: ';\n'
		    	},
		    	dist: {
	        		files: {
	        			'public/dist/js/<%= pkg.name %>.js': ['public/app/app.js', 'public/app/*/*.js', 'public/app/*/*/*.js']
		        	}
		    	},
		    	libs: {
		        	files: {
	            		'public/dist/js/<%= pkg.name %>-libs.js': [
                        		'public/javascripts/jquery-1.11.2.min.js',
                        		'public/javascripts/bootstrap-3.3.5.min.js',
	                        	'public/javascripts/angular.min.js',
	                        	'public/javascripts/angular-route.min.js',
														'public/javascripts/ui-bootstrap-tpls-0.13.3.min.js',
														'public/javascripts/Chart.min.js',
														'public/javascripts/angular-chart.min.js',
														'public/javascripts/ng-table-custom.min.js',
														'public/javascripts/ng-csv.min.js',
														'public/javascripts/angular-sanitize.min.js'
		            	]
		        	}
		    	}
		},
    		uglify: {
      		options: {
        			banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
      		},
      		dist: {
	                files: {
					'public/dist/js/<%= pkg.name %>.min.js': ['public/app/app.js', 'public/app/*/*.js', 'public/app/*/*/*.js']
	                }
            	},
            	libs:{
                		files: {
                    		'public/dist/js/<%= pkg.name %>-libs.min.js': [
                        		'public/javascripts/jquery-1.11.2.min.js',
	                        	'public/javascripts/angular.min.js',
	                        	'public/javascripts/angular-route.min.js',
	                        	'public/javascripts/bootstrap-3.3.5.min.js',
														'public/javascripts/ui-bootstrap-tpls-0.13.3.min.js',
														'public/javascripts/Chart.min.js',
														'public/javascripts/angular-chart.min.js',
														'public/javascripts/ng-table-custom.min.js',
														'public/javascripts/ng-csv.min.js',
														'public/javascripts/angular-sanitize.min.js'
	                    	]
	                	}
            	}
		},
		cssmin: {
		    	combine: {
		        	files: {
	            		'public/dist/css/<%= pkg.name %>.css': [
		                		'public/stylesheets/bootstrap-3.3.5.min.css',
												'public/stylesheets/animate.css',
		                		'public/stylesheets/styles.css'
		            	]
		        	}
		    	}
		},
		copy: {
		    	fonts: {
		        	expand: true,
		        	src: 'public/fonts/**',
		        	dest: 'public/dist/fonts/',
		        	flatten: true,
		        	filter: 'isFile'
		    	}
		},
		cacheBust: {
		    	options: {
		        	encoding: 'utf8',
		        	algorithm: 'md5',
		        	length: 8,
		        	rename: false
		    	},
		    	assets: {
		        	files: [
            			{
	                			src: ['public/index.html']
		            	}
		        	]
		    	}
		},
		watch: {
		    	js: {
		        	files: ['public/app/app.js', 'public/app/*/*.js', 'public/app/*/*/*.js'],
		        	tasks: ['concat:dist', 'uglify:dist', 'cacheBust']
		    	},
		    	css:{
		        	files: ['public/stylesheets/*.css'],
		        	tasks: ['cssmin', 'cacheBust']
		    	},
		    	fonts: {
		        	files: ['public/fonts/*'],
		        	task: ['copy:fonts']
		    	},
		    	templates : {
		        	files: ['public/app/views/*.html'],
		        	tasks: ['concat:dist', 'uglify:dist', 'cacheBust']
		    	}
		},
      	build: {
    			src: 'src/<%= pkg.name %>.js',
    			dest: 'build/<%= pkg.name %>.min.js'
      	}
  	});

	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-cache-bust');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-cssmin');

	grunt.registerTask('default', ['concat','uglify','cssmin','copy:fonts','cacheBust']);
	grunt.registerTask('dev', ['concat:dist','uglify:dist','cssmin','copy:fonts','cacheBust', 'watch']);

};
