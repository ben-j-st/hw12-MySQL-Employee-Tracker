# hw12-MySQL-Employee-Tracker
a content management system to help track employees


// select all
SELECT *

// from which table and what you want the alias of the table to be
FROM new_table u1

// join the same table as the second reference 
INNER JOIN new_table u2

// the selected criteria for the join
on u1.manager_id = u2.id;