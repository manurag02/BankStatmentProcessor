"use strict";

// Declare app level module which depends on views, and core components
angular
  .module("myApp", ["ngRoute", "myApp.view1", "myApp.view2", "myApp.version"])
  .config([
    "$locationProvider",
    "$routeProvider",
    "$qProvider",
    function($locationProvider, $routeProvider, $qProvider) {
      $locationProvider.hashPrefix("!");

      $routeProvider.otherwise({ redirectTo: "/view1" });
      $qProvider.errorOnUnhandledRejections(false);
    }
  ])
  .controller("CsvCtrl", [
    "$scope",
    "$http",
    "$q",
    function($scope, $http, $q) {
      console.log("Inside csvctrl");

      var clearAlerts = function() {
        ($scope.error = {}), ($scope.warning = null);
      };

      var holdValue;
      var sExtension;
      var aValidExtensions = ["csv", "xml"];
      var bVal;
      var elementId = [];
      var allResults = [];
      var noDup;
      var endVal;
      var sBal;
      var mute;
      var sum;
      var desc;
      var sCheck;
      var FailureReason = "Duplicate Referece No";
      var FailureReason2 = "Invalid End Balance";

      var validateFile = function validateFile(file_name) {
        // split the filename on "."
        var aFileNameParts = file_name.split(".");
        console.log("aFileNameParts" + aFileNameParts);

        // if there are at least two pieces to the file name, continue the check
        if (aFileNameParts.length > 1) {
          // get the extension (i.e., the last "piece" of the file name)
          sExtension = aFileNameParts[aFileNameParts.length - 1];

          // if the extension is in the array, return true, if not, return false
          bVal = $.inArray(sExtension, aValidExtensions) >= 0 ? true : false;
          console.log("bval" + bVal);
          return bVal;
        } else {
          return false; // invalid file name format (no file extension)
        }
      };

      function printTable(parm) {
        var table = $("<table />").css("width", "100%");

        // var rows = e.target.result.split("\n");
        var rows = parm;
        console.log("rows" + rows);
        for (var i = 0; i < rows.length; i++) {
          var row = $("<tr  />");
          var cells = rows[i].split(",");
          for (var j = 0; j < cells.length; j++) {
            var cell = $("<td />").css("border", "1px solid black");
            cell.html(cells[j]);
            row.append(cell);
          }
          table.append(row);
        }
        $("#dvCSV").html("");
        $("#dvCSV").append(table);
      }

      $scope.reset = function() {
        window.location.reload();
        $("#reset-btn").hide();
      };

      // Upload and read CSV function
      $scope.submitForm = function(form) {
        clearAlerts();
        var filename = document.getElementById("bulkDirectFile");
        if (filename.value.length < 1) {
          $scope.warning = "Please upload a file";
        } else {
          //display CSV file data on page for confirmation
          $scope.title = "Confirm file";

          var file = filename.files[0];
          console.log("your file name is" + file.name);
          var file_name = file.name;
          validateFile(file_name);
          var fileSize = 0;

          if (bVal && sExtension == "csv") {
            $scope.warning = "File Read successfully Press proceed!";
            if (filename.files[0]) {
              var reader = new FileReader();
              reader.onload = function(e) {
                //console.log("rows" + rows);
                printTable(e.target.result.split("\n"));
              };

              reader.readAsText(filename.files[0]);
            }
            return false;
          } else if (bVal && sExtension == "xml") {
            $scope.warning = "XML file uploaded";
            $scope.messages = "File processed successfully! See results below!";

            if (filename.files[0]) {
              console.log("inside if xml");
              var reader = new FileReader();
              reader.onload = function(e) {
                var rows = e.target.result;
                var xml = rows;
                // console.log("inside if xml read xml" + xml);

                function xmlToJson(xml) {
                  // Create the return object
                  var obj = {};

                  if (xml.nodeType == 1) {
                    // element
                    // do attributes
                    if (xml.attributes.length > 0) {
                      obj["attributes"] = {};
                      for (var j = 0; j < xml.attributes.length; j++) {
                        var attribute = xml.attributes.item(j);
                        obj["attributes"][attribute.nodeName] =
                          attribute.nodeValue;
                      }
                    }
                  } else if (xml.nodeType == 3) {
                    // text
                    obj = xml.nodeValue;
                  }

                  // do children
                  // If just one text node inside
                  if (
                    xml.hasChildNodes() &&
                    xml.childNodes.length === 1 &&
                    xml.childNodes[0].nodeType === 3
                  ) {
                    obj = xml.childNodes[0].nodeValue;
                  } else if (xml.hasChildNodes()) {
                    for (var i = 0; i < xml.childNodes.length; i++) {
                      var item = xml.childNodes.item(i);
                      var nodeName = item.nodeName;
                      if (typeof obj[nodeName] == "undefined") {
                        obj[nodeName] = xmlToJson(item);
                      } else {
                        if (typeof obj[nodeName].push == "undefined") {
                          var old = obj[nodeName];
                          obj[nodeName] = [];
                          obj[nodeName].push(old);
                        }
                        obj[nodeName].push(xmlToJson(item));
                      }
                    }
                  }
                  return obj;
                }
                var x2j = [];
                var xmlDOM = new DOMParser().parseFromString(xml, "text/xml");
                var xmobj = xmlToJson(xmlDOM);
                var xmobj1 = JSON.stringify(xmlToJson(xmlDOM), null, " ");
                var len = xmobj.records.record.length;
                console.log("Ref number length" + len);

                elementId.push(
                  "Transaction no of XML" +
                    "," +
                    "Description" +
                    "," +
                    "Failure Reason"
                );
                $scope.warning = "";
                $scope.messages =
                  "File processed successfully! See results below!";

                for (var m = 0; m < len; m++) {
                  noDup = true;
                  holdValue = xmobj.records.record[m].attributes.reference;
                  // console.log(
                  //   "Ref number" + xmobj.records.record[m].attributes.reference
                  // );

                  for (var n = m + 1; n < len; n++) {
                    if (
                      xmobj.records.record[n].attributes.reference === holdValue
                    ) {
                      console.log("Duplicate Ref number" + holdValue);
                      elementId.push(
                        xmobj.records.record[m].attributes.reference +
                          "," +
                          xmobj.records.record[m].description +
                          "," +
                          FailureReason
                      );
                      noDup = false;
                      break;
                    }
                  }
                  console.log("No dup " + noDup);
                  if (noDup) {
                    {
                      sBal = Number(xmobj.records.record[m].startBalance);
                      mute = Number(xmobj.records.record[m].mutation);
                      endVal = Math.round(
                        Number(xmobj.records.record[m].endBalance)
                      );
                      sum = Math.round(sBal * 1 + mute * 1);
                      console.log("sum" + sum);
                      console.log("EndVal " + endVal);
                      if (sum === endVal) {
                        console.log("EndVal " + endVal);
                        sCheck = Math.sign(sum);
                        console.log("Sign test " + sCheck);
                        if (sCheck === -1) {
                          console.log("Invalid End Balance" + endVal);
                          elementId.push(
                            xmobj.records.record[m].attributes.reference +
                              "," +
                              xmobj.records.record[m].description +
                              "," +
                              FailureReason2
                          );
                        }
                      }
                    }
                  }
                }

                console.log("elementlen" + elementId.length);
                console.log("allres" + allResults.length);
                for (var x = 0; x < allResults.length; x++) {
                  console.log(allResults[x]);
                }

                for (var x = 0; x < elementId.length; x++) {
                  console.log(elementId[x]);
                }

                printTable(elementId);
              };
              reader.readAsText(filename.files[0]);
            } else {
              console.log("filename.files" + filename.files[0]);
            }
          } else {
            $scope.warning = "Invalid file Type";
          }
        }
      };

      $scope.add = function() {
        $scope.warning = "";
        $scope.messages = "File processed successfully! See results below!";

        console.log("bVal outside" + bVal);
        //   Convert to JSON function
        if (bVal && sExtension == "csv") {
          console.log("inside add");
          var Table = document.getElementById("Table");
          var file = document.getElementById("bulkDirectFile").files[0];
          $(".loading").show();

          Papa.parse(file, {
            download: true,
            header: true,
            skipEmptyLines: true,
            error: function(err, file, inputElem, reason) {},
            complete: function(results) {
              for (var x = 0; x < results.data.length; x++) {
                allResults.push(results.data[x]);
                console.log(results.data[x]);
              }
              console.log(allResults.length);

              elementId.push(
                "Transaction no of CSV" +
                  "," +
                  "Description" +
                  "," +
                  "Failure Reason"
              );

              for (var z = 0; z < allResults.length; z++) {
                //checkDup(allResults[z].Reference, allResults);
                noDup = true;

                holdValue = allResults[z].Reference;
                console.log("holdValue" + holdValue);
                for (var k = z + 1; k < allResults.length; k++) {
                  if (allResults[k].Reference == holdValue) {
                    console.log("Duplicate Value" + holdValue);
                    elementId.push(
                      allResults[k].Reference +
                        "," +
                        allResults[k].Description +
                        "," +
                        FailureReason
                    );
                    noDup = false;
                    break;
                  }
                }
                console.log("No dup " + noDup);
                if (noDup) {
                  {
                    sBal = Number(allResults[z]["Start Balance"]);
                    mute = Number(allResults[z].Mutation);
                    endVal = Math.round(Number(allResults[z]["End Balance"]));
                    sum = Math.round(sBal * 1 + mute * 1);
                    console.log("sum" + sum);
                    console.log("EndVal " + endVal);
                    if (sum === endVal) {
                      console.log("EndVal " + endVal);
                      sCheck = Math.sign(sum);
                      console.log("Sign test " + sCheck);
                      if (sCheck === -1) {
                        console.log("Invalid End Balance" + endVal);
                        elementId.push(
                          allResults[z].Reference +
                            "," +
                            allResults[z].Description +
                            "," +
                            FailureReason2
                        );
                      }
                    }
                  }
                }
              }

              console.log("elementlen" + elementId.length);
              console.log("allres" + allResults.length);
              for (var x = 0; x < allResults.length; x++) {
                console.log(allResults[x]);
              }

              for (var x = 0; x < elementId.length; x++) {
                console.log(elementId[x]);
              }

              printTable(elementId);
            }
          });
        }
      };
    }
  ]);
