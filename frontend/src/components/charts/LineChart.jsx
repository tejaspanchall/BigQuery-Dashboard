import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

export default function LineChart({ data, title, yAxisLabel }) {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: 'rgb(229, 231, 235)', // text-gray-200
        },
      },
      title: {
        display: true,
        text: title,
        color: 'rgb(229, 231, 235)', // text-gray-200
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: yAxisLabel,
          color: 'rgb(229, 231, 235)', // text-gray-200
        },
        grid: {
          color: 'rgb(75, 85, 99)', // text-gray-600
        },
        ticks: {
          color: 'rgb(229, 231, 235)', // text-gray-200
        },
      },
      x: {
        grid: {
          color: 'rgb(75, 85, 99)', // text-gray-600
        },
        ticks: {
          color: 'rgb(229, 231, 235)', // text-gray-200
        },
      },
    },
  }

  return (
    <div className="h-[400px] w-full bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
      <Line options={options} data={data} />
    </div>
  )
} 