import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
  } from '@mui/material';
  
  function DynamicTable({ data }) {
    if (!data || data.length === 0) {
      return null; // Não renderiza nada se não houver dados
    }
  
    // Obtém a lista de todas as colunas presentes em todos os registros
    const allColumns = data.reduce((columns, row) => {
      Object.keys(row).forEach((col) => {
        if (!columns.includes(col)) {
          columns.push(col);
        }
      });
      return columns;
    }, []);
  
    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              {allColumns.map((colName) => (
                <TableCell key={colName}>{colName}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {allColumns.map((colName) => (
                  <TableCell key={colName}>
                    {row[colName] || ''}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }
  
  export default DynamicTable;
  