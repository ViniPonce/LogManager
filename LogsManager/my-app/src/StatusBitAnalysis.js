import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Grid,
} from '@mui/material';
import ApexCharts from 'apexcharts';
import axios from 'axios';

function StatusBitAnalysis() {
  const [checkboxes, setCheckboxes] = useState({
    BTRC_BIT: false,
    MRST_BIT: false,
    ONOFF: false,
    DAC: false,
    XPS: false,
    SPS: false,
    INET: false,
    RTM: false,
    KMBE: false,
    LOG: false,
    BAT: false,
    DATA: false,
    CMODE: false,
    SIM: false,
    SYNC: false,
    RSU: false,
    DAC_JACK: false,
    PRF_JACK: false,
    DAC_NCSD: false,
    PRF_NCSD: false,
    AWM: false,
    BAD_MNET: false,
    LINEIN_JACK: false,
    DAC_SIGNAL: false,
  });

  const [data, setData] = useState([]);
  const [chart, setChart] = useState(null);
  const [lastBitValues, setLastBitValues] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/logs', {
          params: {
            logType: 'statusbitlog',
          },
        });
        const logs = response.data;
        setData(logs);
        createChart(logs);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, []);

  const createChart = (logs) => {
    const checkedBoxes = Object.entries(checkboxes)
      .filter(([key, value]) => value)
      .map(([key]) => key);

    const series = checkedBoxes.map((key) => {
      const bitRegex = new RegExp(`${key}\\s*=\\s*(\\d)`, 'i');
      return {
        name: key,
        data: logs.map((row) => {
          const match = row.bit_status.match(bitRegex);
          const bitValue = match ? parseInt(match[1]) : 0;
          return {
            x: new Date(row.timestamp).getTime(),
            y: bitValue,
          };
        }),
      };
    });

    const options = {
      chart: {
        type: 'line',
        height: 400,
      },
      series,
      xaxis: {
        type: 'datetime',
      },
      yaxis: {
        tickAmount: 2,
        min: 0.0,
        max: 2.5,
        labels: {
          show: false,
        },
      },
      dataLabels: {
        enabled: false,
      },
      markers: {
        size: 0,
        style: 'hollow',
      },
      stroke: {
        curve: 'stepline',
        fill: {
          type: 'solid',
          colors: ['transparent', 'rgba(0, 0, 0, 0.1)'],
        },
      },
      grid: {
        borderColor: '#f1f1f1',
      },
      tooltip: {
        x: {
          format: 'dd/MM/yyyy HH:mm:ss',
        },
        y: {
          formatter: (value) => (value === 1 ? '1' : '0'),
        },
      },
    };

    const chart = new ApexCharts(document.querySelector('#chart'), options);
    chart.render();
    setChart(chart);

    chart.w.globals.markers.forEach((marker, index) => {
      marker.addEventListener('mouseenter', () => {
        const seriesIndex = Math.floor(index / 2);
        const dataPointIndex = index % 2 === 0 ? 0 : 1;
        const seriesName = chart.w.globals.seriesNames[seriesIndex];
        const seriesData = chart.w.globals.series[seriesIndex].data;
        const dataPoint = seriesData[dataPointIndex];
        const timestamp = new Date(dataPoint.x);
        const tooltipContent = `<div>Bit: ${seriesName}</div><div>Valor: ${
          dataPoint.y
        }</div><div>Horário: ${timestamp.toLocaleString()}</div>`;
        chart.showTooltip(
          { seriesIndex, dataPointIndex, y: dataPoint.y },
          marker,
          false,
          tooltipContent
        );
      });

      marker.addEventListener('mouseleave', () => {
        chart.hideTooltip();
      });
    });
  };

  const handleCheckboxChange = (event) => {
    const { name, checked } = event.target;

    setCheckboxes((prevState) => ({
      ...prevState,
      [name]: checked,
    }));
  };

  useEffect(() => {
    if (chart) {
      const checkedBoxes = Object.entries(checkboxes)
        .filter(([key, value]) => value)
        .map(([key]) => key);

      const updatedSeries = checkedBoxes.map((key) => {
        const bitRegex = new RegExp(`${key}\\s*=\\s*(\\d)`, 'i');
        return {
          name: key,
          data: data.map((row) => {
            const match = row.bit_status.match(bitRegex);
            const bitValue = match ? parseInt(match[1]) : 0;
            return {
              x: new Date(row.timestamp).getTime(),
              y: bitValue,
            };
          }),
        };
      });

      chart.updateSeries(updatedSeries);
    }
  }, [checkboxes, data]);

  useEffect(() => {
    const updatedLastBitValues = {};
    data.forEach((row) => {
      Object.entries(checkboxes).forEach(([key, value]) => {
        if (value) {
          const bitRegex = new RegExp(`${key}\\s*=\\s*(\\d)`, 'i');
          const match = row.bit_status.match(bitRegex);
          const bitValue = match ? parseInt(match[1]) : 0;
          updatedLastBitValues[key] = bitValue;
        }
      });
    });
    setLastBitValues(updatedLastBitValues);
  }, [data, checkboxes]);

  return (
    <Box>
      <Typography variant="h5" align="center" gutterBottom>
        Status Bit Analysis
      </Typography>

      <Grid container spacing={2} style={{ marginTop: '20px' }}>
        <Grid item xs={3}>
          <Box sx={{ border: '1px solid white', borderRadius: '4px', padding: '8px' }}>
            <Typography variant="h6" align="left" gutterBottom>
              Bits
            </Typography>
            <FormGroup>
              {Object.entries(checkboxes).map(([name, checked]) => (
                <FormControlLabel
                  key={name}
                  control={
                    <Checkbox
                      checked={checked}
                      onChange={handleCheckboxChange}
                      name={name}
                      color="primary"
                    />
                  }
                  label={`${name} Bit`}
                />
              ))}
            </FormGroup>
          </Box>
        </Grid>

        <Grid item xs={9}>
          <Box id="chart" sx={{ height: '200px', marginTop: '16px' }} />
        </Grid>
      </Grid>
    </Box>
  );
}

export default StatusBitAnalysis;
