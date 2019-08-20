# joy.table
a generic data table based on dom, jquery, jquery-ui, bootstrap css

1. create a div tag
   <div id='myJoyTable1'></div>
   
2. new joytable class
   var tbl1 = new JoyTable();
   
3. initial joytable
   tbl1.TableInitial(document.getElemenyById('myJoyTable1'));

4. put data to joytable
   tbl1.AddRows(data);

5. done


to customize the your table, you need give config when TableInitial. 
for example:
  tbl1.TableInitial(document.getElemenyById('myJoyTable1'), cfg);
you can use tbl1.ExportConfigurations() to get the joytable config template string after tbl1.AddRows(data).
use JSON.parse(configString) to recover string as JS object and then modify the config.


[testJoyTable.html]
 example file for joytable to render random data
 
[testDataTable.html]
 render same data by jQuery.DataTable. use for performance compared to JoyTable 
