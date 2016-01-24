/* global
  jasmine
*/
var JEST_JUNIT_OUTPUT_DIR = process.env.JEST_JUNIT_OUTPUT_DIR ||
  'test-reports'

jasmine.VERBOSE = false

require('jasmine-reporters')

var reporter = new jasmine.JUnitXmlReporter(JEST_JUNIT_OUTPUT_DIR)

jasmine.getEnv().addReporter(reporter)
