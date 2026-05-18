function makeChartConfig(data, labels) {
  const minutes = data.map((value) => Math.max(0, value || 0));

  return {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Minutes played',
        data: minutes,
        borderColor: '#92ac86',
        borderWidth: 2.5,
        pointBackgroundColor: '#c0e0b8',
        pointBorderColor: '#2f2e2a',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
        fill: true,
        backgroundColor: 'rgba(192,224,184,0.18)',
        tension: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#131111',
          titleColor: '#c0e0b8',
          bodyColor: '#c0e0b8',
          padding: 10,
          callbacks: { label: (ctx) => ` ${ctx.parsed.y}m` }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#92ac86', font: { size: 12 } },
          border: { display: false }
        },
        y: {
          beginAtZero: true,
          min: 0,
          grid: { color: 'rgba(144,172,134,0.12)' },
          ticks: { color: '#92ac86', font: { size: 11 }, callback: (v) => `${v}m` },
          border: { display: false }
        }
      }
    }
  };
}

export function renderMinutesChart(currentChart, canvasId, data, labels) {
  if (currentChart) currentChart.destroy();

  return new Chart(
    document.getElementById(canvasId).getContext('2d'),
    makeChartConfig(data, labels)
  );
}

export function renderStatsChart(currentChart, canvasId, history) {
  if (currentChart) currentChart.destroy();

  const minutes = history.map(({ minutes }) => Math.max(0, minutes || 0));

  return new Chart(
    document.getElementById(canvasId).getContext('2d'),
    {
      type: 'line',
      data: {
        labels: history.map(({ period }) => period),
        datasets: [
          {
            label: 'Minutes played',
            data: minutes,
            borderColor: '#c0e0b8',
            borderWidth: 2.5,
            pointRadius: 4,
            pointHoverRadius: 6,
            fill: true,
            backgroundColor: 'rgba(192,224,184,0.16)',
            tension: 0
          },
          {
            label: 'Sessions',
            data: history.map(({ sessions }) => sessions),
            borderColor: '#edf1e8',
            borderWidth: 2,
            pointRadius: 3,
            pointHoverRadius: 5,
            yAxisID: 'sessions',
            tension: 0
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: {
            labels: { color: '#edf1e8', boxWidth: 10, boxHeight: 10 }
          },
          tooltip: {
            backgroundColor: '#131111',
            titleColor: '#c0e0b8',
            bodyColor: '#edf1e8',
            padding: 10
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: '#92ac86', font: { size: 12 }, maxRotation: 0 },
            border: { display: false }
          },
          y: {
            beginAtZero: true,
            min: 0,
            grid: { color: 'rgba(144,172,134,0.12)' },
            ticks: { color: '#92ac86', font: { size: 11 }, callback: (v) => `${v}m` },
            border: { display: false }
          },
          sessions: {
            position: 'right',
            beginAtZero: true,
            min: 0,
            grid: { display: false },
            ticks: { color: '#edf1e8', font: { size: 11 }, precision: 0 },
            border: { display: false }
          }
        }
      }
    }
  );
}
