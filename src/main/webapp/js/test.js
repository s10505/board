function generateSQL(tableName, operation, columns, values, condition) {
    let sql = '';
  
    switch (operation.toUpperCase()) {
      case 'INSERT':
        sql = generateInsertSQL(tableName, columns, values);
        break;
      case 'UPDATE':
        sql = generateUpdateSQL(tableName, columns, values, condition);
        break;
      case 'DELETE':
        sql = generateDeleteSQL(tableName, condition);
        break;
      default:
        throw new Error('Invalid operation. Use INSERT, UPDATE, or DELETE.');
    }
  
    return sql;
  }
  
  function generateInsertSQL(tableName, columns, values) {
    if (columns.length !== values.length) {
      throw new Error('Columns and values must have the same length.');
    }
  
    const columnNames = columns.join(', ');
    const valuePlaceholders = values.map(() => '?').join(', ');
  
    return `INSERT INTO ${tableName} (${columnNames}) VALUES (${valuePlaceholders});`;
  }
  
  function generateUpdateSQL(tableName, columns, values, condition) {
    if (columns.length !== values.length) {
      throw new Error('Columns and values must have the same length.');
    }
  
    const setClauses = columns
      .map((col, index) => `${col} = ?`)
      .join(', ');
  
    return `UPDATE ${tableName} SET ${setClauses} WHERE ${condition};`;
  }
  
  function generateDeleteSQL(tableName, condition) {
    return `DELETE FROM ${tableName} WHERE ${condition};`;
  }
  
  // 예시 사용법
  const tableName = 'users';
  const columns = ['name', 'email', 'age'];
  const values = ['John Doe', 'john@example.com', 30];
  const condition = 'id = 1';
  
  console.log(generateSQL(tableName, 'INSERT', columns, values)); // INSERT SQL
  console.log(generateSQL(tableName, 'UPDATE', columns, values, condition)); // UPDATE SQL
  console.log(generateSQL(tableName, 'DELETE', [], [], condition)); // DELETE SQL











INSERT INTO tableId
(
    column1
    ,column2
    ,column3
    ,column4
    ,column5
    ,column6
    ,column7
)
values
(

     (SELECT ID F
    ,''
    ,''




)











