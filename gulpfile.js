var gulp = require('gulp');
var babel = require('gulp-babel');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var git = require('gulp-git');
var sync = require('gulp-sync')(gulp);
var sass = require('gulp-sass');
var fs = require('fs');

var components =[
    'person',
    'organization',
    'organizationType'
    ];
// For each file (with no extension),
// if value is "true", use the .js version to build .min.js version,
// if value is an array, aggregate the files to the .min.js version.
var filesJs = {
  'web/bundles/semapps/front/src/main': true,
  // Main admin script.
  'web/bundles/semapps/admin/js/dist/script': [
    'web/bundles/semapps/admin/js/src/class/cartoAdmin.js',
    'web/bundles/semapps/admin/js/src/class/cartoAdminPage.js',
    // Page specific scripts.
    'web/bundles/semapps/admin/js/src/class/cartoAdminPageTeam.js',
    'web/bundles/semapps/admin/js/src/class/cartoAdminPageUser.js',
    'web/bundles/semapps/admin/js/src/class/cartoAdminPageProfile.js',
    'web/bundles/semapps/admin/js/src/class/cartoAdminPageOrga.js',
    'web/bundles/semapps/admin/js/src/class/cartoAdminPageComponent.js',
    'web/bundles/semapps/admin/js/src/class/cartoAdminPageComponentAddress.js',
    // Fields.
      'vendor/VirtualAssembly/SemanticFormsBundle/VirtualAssembly/SemanticFormsBundle/Resources/js/field.uri.js',
      'vendor/VirtualAssembly/SemanticFormsBundle/VirtualAssembly/SemanticFormsBundle/Resources/js/field.dbPedia.js',
      'vendor/VirtualAssembly/SemanticFormsBundle/VirtualAssembly/SemanticFormsBundle/Resources/js/field.Adresse.js',
      'vendor/VirtualAssembly/SemanticFormsBundle/VirtualAssembly/SemanticFormsBundle/Resources/js/field.Multiple.js',
      'vendor/VirtualAssembly/SemanticFormsBundle/VirtualAssembly/SemanticFormsBundle/Resources/js/field.thesaurus.js',
      'vendor/VirtualAssembly/SemanticFormsBundle/VirtualAssembly/SemanticFormsBundle/Resources/js/semanticForms.js',
    // Launcher
    'web/bundles/semapps/admin/js/src/main.js'
  ],
  // Front
  'web/bundles/semapps/front/src/semapps-avatar/semapps-avatar': true,
  'web/bundles/semapps/front/src/semapps-tag/semapps-tag': true,
  'web/bundles/semapps/front/src/semapps-carto/semapps-carto': true,
  'web/bundles/semapps/front/src/semapps-header/semapps-header': true,
  'web/bundles/semapps/front/src/semapps-results/semapps-results': true,
  'web/bundles/semapps/front/src/semapps-results-tab/semapps-results-tab': true,
  'web/bundles/semapps/front/src/semapps-results-item/semapps-results-item': true,
  'web/bundles/semapps/front/src/semapps-logo-animated/semapps-logo-animated': true,
  // 'web/bundles/semapps/front/src/semapps-logo-mini/semapps-logo-mini': true,
  'web/bundles/semapps/front/src/semapps-detail/semapps-detail': true,
  'web/bundles/semapps/front/src/semapps-ressource/semapps-ressource': true,
  'web/bundles/semapps/front/src/semapps-map/semapps-map': true,
  'web/bundles/semapps/front/src/semapps-schema/semapps-schema': true,
  'web/bundles/semapps/front/src/semapps-prez/semapps-prez': true,
  'web/bundles/semapps/front/src/semapps-map-pin/semapps-map-pin': true
};

var filesScss = {
  // Semantic Forms.
  //'src/VirtualAssembly/SemanticFormsBundle/Resources/css/semanticForms': true,
  // Admin
  'web/bundles/semapps/admin/css/menu': true,
  'web/bundles/semapps/admin/css/style': true,
  // Front
  'web/bundles/semapps/front/css/style': true,
  'web/bundles/semapps/front/src/semapps-avatar/semapps-avatar': true,
  'web/bundles/semapps/front/src/semapps-tag/semapps-tag': true,
  'web/bundles/semapps/front/src/semapps-carto/semapps-carto': true,
  'web/bundles/semapps/front/src/semapps-spinner/semapps-spinner': true,
  'web/bundles/semapps/front/src/semapps-results/semapps-results': true,
  'web/bundles/semapps/front/src/semapps-results-tab/semapps-results-tab': true,
  'web/bundles/semapps/front/src/semapps-results-item/semapps-results-item': true,
  'web/bundles/semapps/front/src/semapps-header/semapps-header': true,
  'web/bundles/semapps/front/src/semapps-detail/semapps-detail': true,
  'web/bundles/semapps/front/src/semapps-ressource/semapps-ressource': true,
  'web/bundles/semapps/front/src/semapps-detail/semapps-detail-inner': true,
  'web/bundles/semapps/front/src/semapps-logo-animated/semapps-logo-animated': true,
  'web/bundles/semapps/front/src/semapps-logo-mini/semapps-logo-mini': true,
  'web/bundles/semapps/front/src/semapps-map/semapps-map': true,
  'web/bundles/semapps/front/src/semapps-schema/semapps-schema': true,
  'web/bundles/semapps/front/src/semapps-map-pin/semapps-map-pin': true,
  'web/bundles/semapps/front/src/semapps-prez/semapps-prez': true,

};

function getFilesOptions(destFile, sourceFiles, sourceExt, destExt) {
  "use strict";
  // Get source from dest if not defined.
  if (sourceFiles === true) {
    sourceFiles = [destFile + '.' + sourceExt];
  }
  else if (typeof sourceFiles === 'string') {
    sourceFiles = [sourceFiles];
  }

  sourceFiles.map((file) => {
    if (!fs.existsSync(file)) {
      console.error('Missing ' + file);
    }
  });

  var split = destFile.split('/');
  var destFileName = split.pop();
  var destFilePath = split.join('/') + '/';

  return {
    sourceFiles: sourceFiles,
    destFileName: destFileName,
    destFilePath: destFilePath
  };
}

function buildFiles(files, action, sourceExt, destExt) {
  components.forEach(function(element) {
      files ['web/bundles/semapps/front/src/semapps-detail-'+element+'/semapps-detail-'+element] = true;
      files ['web/bundles/semapps/front/src/semapps-results-'+element+'/semapps-results-'+element] = true;
  });
  console.log(files)
  // One task for each file separately.
  Object.keys(files).map((destFile) => {
    var fileData = getFilesOptions(destFile, files[destFile], sourceExt);
    console.log('Building ' + fileData.destFilePath + fileData.destFileName + '.' + destExt + ' ...');
    action(destFile, fileData, sourceExt, destExt);
  });
}

var tasksCounter = 0;
var allTasks = [];

buildFiles(filesJs, (destFile, fileData, sourceExt, destExt) => {
  "use strict";
  let key = 'buildFileJs' + tasksCounter++;
  allTasks.push(key);
  gulp.task(key, () => {
    // Create task.
    gulp.src(fileData.sourceFiles, {base: "./"})
      // Create ap file.
      .pipe(sourcemaps.init())
      // Transpile.
      .pipe(babel({
        presets: ['@babel/latest']
      }))
      // Set dest name.
      .pipe(concat(fileData.destFileName + '.' + destExt))
      // Compress.
      .pipe(uglify())
      // Write map file.
      .pipe(sourcemaps.write('.'))
      // Write.
      .pipe(gulp.dest(fileData.destFilePath));
  });
}, 'js', 'min.js');

buildFiles(filesScss, (destFile, fileData, sourceExt, destExt) => {
  "use strict";
  let key = 'buildFileCss' + tasksCounter++;
  allTasks.push(key);
  gulp.task(key, () => {
    gulp.src(fileData.sourceFiles, {base: "./"})
      // Set dest name.
      .pipe(concat(fileData.destFileName + '.' + destExt))
      .pipe(sass({
        includePaths: [fileData.destFilePath]
      }).on('error', sass.logError))
      .pipe(gulp.dest(fileData.destFilePath));
  });
}, 'scss', 'css');

function getFiles(registery, ext, sourceFiles) {
  "use strict";
  Object.keys(registery).map((destFiles) => {
    "use strict";
    let source = registery[destFiles];
    if (source === true) {
      sourceFiles.push(destFiles + '.' + ext);
    }
    else if (typeof source === 'string') {
      sourceFiles.push(source);
    }
    else {
      for (let i = 0; i < source.length; i++) {
        sourceFiles.push(source[i]);
      }
    }
  });
}

// Define files to watch.
gulp.task('watch', () => {
  var sourceFiles = [];
  getFiles(filesJs, 'js', sourceFiles);
  getFiles(filesScss, 'scss', sourceFiles);

  // Check
  sourceFiles.map((file) => {
    if (!fs.existsSync(file)) {
      console.error('Missing watched file : ' + file);
    }
  });

  gulp.watch(sourceFiles, [allTasks]);
});

gulp.task('default', allTasks.concat('watch'));
