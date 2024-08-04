import { supabase } from "./initSupabase.js";
import { csvParse } from "https://cdn.jsdelivr.net/npm/d3-dsv@3/+esm";


export const CsvTables = (options) => {
  options = options || {};
  var csv_path = options.csv_path || "";
  var el = options.element || "table-container";
  var el2 = options.element2 || "table-kebutuhan-guru";
  var allow_download = options.allow_download || false;
  var csv_options = options.csv_options || {};
  var datatables_options = options.datatables_options || {};
  var custom_formatting = options.custom_formatting || [];
  var customTemplates = {};
  $.each(custom_formatting, function (i, v) {
    var colIdx = v[0];
    var func = v[1];
    customTemplates[colIdx] = func;
  });



  var $table = $("<table class='display' id='" + el + "-table'></table>");
  var $containerElement = $("#" + el);
  $containerElement.empty().append($table);

  // trigger the search button when user presses the html button

  $.when($.get(csv_path)).then(
    function (data) {
      var csvData = $.csv.toArrays(data, csv_options);
      var $tableHead = $("<thead></thead>");
      var csvHeaderRow = csvData[0];
      var $tableHeadRow = $("<tr></tr>");
      for (var headerIdx = 0; headerIdx < csvHeaderRow.length; headerIdx++) {
        $tableHeadRow.append($("<th></th>").text(csvHeaderRow[headerIdx]));
      }
      $tableHead.append($tableHeadRow);

      $table.append($tableHead);
      var $tableBody = $("<tbody></tbody>");

      for (var rowIdx = 1; rowIdx < csvData.length; rowIdx++) {
        var $tableBodyRow = $("<tr></tr>");
        for (var colIdx = 0; colIdx < csvData[rowIdx].length; colIdx++) {
          var $tableBodyRowTd = $("<td></td>");
          var cellTemplateFunc = customTemplates[colIdx];
          if (cellTemplateFunc) {
            $tableBodyRowTd.html(cellTemplateFunc(csvData[rowIdx][colIdx]));
          } else {
            $tableBodyRowTd.text(csvData[rowIdx][colIdx]);
          }
          $tableBodyRow.append($tableBodyRowTd);
          $tableBody.append($tableBodyRow);
        }
      }
      $table.append($tableBody);

      $table.DataTable(datatables_options);

      $('#pppkSearch').on('click', function () {
        // Perform search. Replace 'Your Search Term' with the actual search term.
        $table.DataTable().search('PPPK').draw();
      });

      $('#asnSearch').on('click', function () {
        // Perform search. Replace 'Your Search Term' with the actual search term.
        $table.DataTable().search('PNS').draw();
      });

      $('#honorerSearch').on('click', function () {
        // Perform search. Replace 'Your Search Term' with the actual search term.
        $table.DataTable().search('Honor Sekolah').draw();
      });

      async function checkUserLoggedIn() {
        const { data: user, error } = await supabase.auth.getUser();
        return !!user.user;
      }

      // Call the function and append the button only if the user is logged in
      checkUserLoggedIn().then(isLoggedIn => {
        if (isLoggedIn) {
          $containerElement.append("<p><button id='uploadBtn' class='button button-primary mb-4'>Upload Data Baru</button></p>");

          // Add click event listener to the 'Upload Data Baru' button here if needed
          // event listener to trigger the file input click event when the new button is clicked
          $(document).on('click', '#uploadBtn', function () {
            // Check if #fileInput exists
            if ($("#fileInput").length === 0) {
              // If it doesn't exist, create and append it to a suitable container
              $("body").append('<input type="file" id="fileInput" style="display: none;" />');
            }
            // Now, trigger the click event on #fileInput
            $("#fileInput").click();
            $("#fileInput").change(async function (e) {
              if (e.target.files.length > 0) {
                const file = e.target.files[0];
                //adjust the filename to include timestamp
                const d = new Date();
                const timestamp = d.getTime();
                const filePath = `uploaded/${timestamp}-${file.name}`;

                try {
                  const { data, error } = await supabase.storage.from('simpkt-csv').upload(filePath, file);

                  if (error) {
                    throw error;
                  }

                  // insert rows from CSV file into table
                  const reader = new FileReader();
                  reader.readAsText(file);
                  reader.onload = async function () {
                    const csv = reader.result;
                    const dataArray = csvParse(csv);
                    const values = dataArray.map(row => row);

                    const { error } = await supabase
                      .from('main')
                      .upsert(values)
                      .select()
                      .then(
                        function () {
                          // alert the user of a successful upload
                          alert("File uploaded successfully. Click 'Download Data' to view the updated data.");

                          //reload the page to show the updated data
                          location.reload();
                        }
                      );


                    if (error) {
                      throw error;
                    }

                  }

                } catch (error) {
                  console.error('Error uploading file:', error.message);
                }
              }
            });

          });
        }
      });

      if (allow_download) {
        $containerElement.append("<p><a class='button button-primary' href='" + csv_path + "'><i class='glyphicon glyphicon-download'></i> Download Data</a></p>");
      }
    });

  const $table2 = $("<table class='display' id='" + el2 + "-table'></table>");
  const $containerElement2 = $("#" + el2);

  $containerElement2.empty().append($table2);

  supabase.rpc('get_teachers_needed').then(function (data) {
    const csvData = data.data.map(Object.values);

    var $table2Head = $("<thead></thead>");
    var csvHeaderRow = ["NPSN", "Nama Sekolah", "Kebutuhan Guru", "Guru Yang Ada", "Lebih/Kurang", "Selisih"];
    var $table2HeadRow = $("<tr></tr>");
    for (var headerIdx = 0; headerIdx < csvHeaderRow.length; headerIdx++) {
      $table2HeadRow.append($("<th></th>").text(csvHeaderRow[headerIdx]));
    }
    $table2Head.append($table2HeadRow);

    $table2.append($table2Head);
    var $table2Body = $("<tbody></tbody>");

    for (var rowIdx = 1; rowIdx < csvData.length; rowIdx++) {
      var $table2BodyRow = $("<tr></tr>");
      for (var colIdx = 0; colIdx < csvData[rowIdx].length; colIdx++) {
        var $table2BodyRowTd = $("<td></td>");
        var cellTemplateFunc = customTemplates[colIdx];
        if (cellTemplateFunc) {
          $table2BodyRowTd.html(cellTemplateFunc(csvData[rowIdx][colIdx]));
        } else {
          $table2BodyRowTd.text(csvData[rowIdx][colIdx]);
        }
        $table2BodyRow.append($table2BodyRowTd);
        $table2Body.append($table2BodyRow);
      }
    }
    $table2.append($table2Body);
    $table2.DataTable({
      "lengthChange": true,
      "pageLength": 10,
      "scrollX": true,
      "paging": true,
      "order": [[4, "desc"]]
    })


    $('#sdSearch').on('click', function () {
      // Perform search. Replace 'Your Search Term' with the actual search term.
      $table2.DataTable().search('SD').draw();
    });

    $('#smpSearch').on('click', function () {
      // Perform search. Replace 'Your Search Term' with the actual search term.
      $table2.DataTable().search('SMP').draw();
    });


    async function checkUserLoggedIn() {
      const { data: user, error } = await supabase.auth.getUser();
      return !!user.user;
    }

    // Call the function and append the button only if the user is logged in
    checkUserLoggedIn().then(isLoggedIn => {
      if (isLoggedIn) {
        $containerElement2.append("<p><button id='uploadRombel' class='button button-primary mb-4'>Upload Data Rombel</button></p>");

        // Add click event listener to the 'Upload Data Baru' button here if needed
        // event listener to trigger the file input click event when the new button is clicked
        $(document).on('click', '#uploadRombel', function () {
          // Check if #fileInput exists
          if ($("#fileRombel").length === 0) {
            // If it doesn't exist, create and append it to a suitable container
            $("body").append('<input type="file" id="fileRombel" style="display: none;" />');
          }
          // Now, trigger the click event on #fileRombel
          $("#fileRombel").click();
          $("#fileRombel").change(async function (e) {
            if (e.target.files.length > 0) {
              const file = e.target.files[0];
              //adjust the filename to include timestamp
              const d = new Date();
              const timestamp = d.getTime();
              const filePath = `rombel/${timestamp}-${file.name}`;

              try {
                const { data, error } = await supabase.storage.from('simpkt-csv').upload(filePath, file);

                if (error) {
                  throw error;
                }

                // insert rows from CSV file into table
                const reader = new FileReader();
                reader.readAsText(file);
                reader.onload = async function () {
                  const csv = reader.result;
                  const dataArray = csvParse(csv);
                  const values = dataArray.map(row => row);

                  try {
                    const { data, error } = await supabase
                      .from('rombel')
                      .upsert(values)
                      .select();

                    if (error) {
                      throw error;
                    }

                    // Alert the user of a successful upload
                    alert("File uploaded successfully. Click 'Download Data' to view the updated data.");

                    // Optionally, reload the page to show the updated data
                    location.reload();
                  } catch (error) {
                    console.error('Error uploading file:', error.message);
                    alert('Error uploading file: ' + error.message);
                  }
                };


              } catch (error) {
                console.error('Error uploading file:', error.message);
              }
            }
          });

        });
      }
    });



  }).catch(function (error) {
    console.log('Error loading data:', error);
  });

}
