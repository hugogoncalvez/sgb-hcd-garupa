'use client';

import React, { useState } from 'react';
import { trpc } from '@/utils/trpc';
import { MainLayout } from '@/components/layout/MainLayout';
import {
  TrendingUp,
  Users,
  BookOpen,
  AlertTriangle,
  MapPin,
  Package,
  Globe,
  Calendar,
  Building2,
  Library,
  BarChart3 as BarChartIcon,
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Doughnut, Pie, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
);

const COLORS = [
  '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
  '#ec4899', '#f43f5e', '#ef4444', '#f97316',
  '#eab308', '#84cc16', '#22c55e', '#14b8a6',
  '#06b6d4', '#0ea5e9', '#3b82f6',
];

export default function ReportesPage() {
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');

  const { data, isLoading } = trpc.reportes.getAll.useQuery({
    fechaDesde: fechaDesde || undefined,
    fechaHasta: fechaHasta || undefined,
  });

  const reportCards = [
    {
      id: 'prestamos-periodo',
      title: 'Préstamos por Período',
      icon: <Calendar className="text-indigo-600" size={24} />,
      description: 'Evolución mensual de préstamos',
      content: data && (
        <div className="h-64">
          <Bar
            data={{
              labels: data.prestamosPorPeriodo.map((p) => p.periodo),
              datasets: [{
                label: 'Préstamos',
                data: data.prestamosPorPeriodo.map((p) => p.cantidad),
                backgroundColor: '#6366f1',
                borderRadius: 6,
              }],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: {
                y: { beginAtZero: true, ticks: { stepSize: 1 } },
                x: { grid: { display: false } },
              },
            }}
          />
        </div>
      ),
    },
    {
      id: 'libros-prestados',
      title: 'Libros Más Prestados',
      icon: <BookOpen className="text-violet-600" size={24} />,
      description: 'Top 10 títulos más solicitados',
      content: data && data.librosMasPrestados.length > 0 ? (
        <div className="h-64">
          <Bar
            data={{
              labels: data.librosMasPrestados.map((l) =>
                l.titulo.length > 25 ? l.titulo.slice(0, 25) + '…' : l.titulo
              ),
              datasets: [{
                label: 'Préstamos',
                data: data.librosMasPrestados.map((l) => l.total),
                backgroundColor: data.librosMasPrestados.map((_, i) => COLORS[i % COLORS.length]),
                borderRadius: 6,
              }],
            }}
            options={{
              indexAxis: 'y' as const,
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: {
                x: { beginAtZero: true, ticks: { stepSize: 1 } },
                y: { grid: { display: false } },
              },
            }}
          />
        </div>
      ) : (
        <p className="text-slate-400 dark:text-slate-500 text-center py-12 font-semibold">
          Sin datos en el período seleccionado
        </p>
      ),
    },
    {
      id: 'socios-activos',
      title: 'Socios Más Activos',
      icon: <Users className="text-emerald-600" size={24} />,
      description: 'Top 10 socios con más préstamos',
      content: data && data.sociosMasActivos.length > 0 ? (
        <div className="h-64">
          <Bar
            data={{
              labels: data.sociosMasActivos.map((s) =>
                `${s.nombre} ${s.apellido}`.length > 22
                  ? `${s.nombre} ${s.apellido}`.slice(0, 22) + '…'
                  : `${s.nombre} ${s.apellido}`
              ),
              datasets: [{
                label: 'Préstamos',
                data: data.sociosMasActivos.map((s) => s.total),
                backgroundColor: data.sociosMasActivos.map((_, i) => COLORS[i % COLORS.length]),
                borderRadius: 6,
              }],
            }}
            options={{
              indexAxis: 'y' as const,
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: {
                x: { beginAtZero: true, ticks: { stepSize: 1 } },
                y: { grid: { display: false } },
              },
            }}
          />
        </div>
      ) : (
        <p className="text-slate-400 dark:text-slate-500 text-center py-12 font-semibold">
          Sin datos en el período seleccionado
        </p>
      ),
    },
    {
      id: 'vencidos',
      title: 'Préstamos Vencidos',
      icon: <AlertTriangle className="text-rose-600" size={24} />,
      description: `${data?.prestamosVencidos.length ?? 0} préstamos atrasados`,
      content: data && data.prestamosVencidos.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider text-xs">
                <th className="pb-3 pr-4">Socio</th>
                <th className="pb-3 pr-4">Libro</th>
                <th className="pb-3 pr-4">Vencimiento</th>
                <th className="pb-3 text-right">Días</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {data.prestamosVencidos.map((p) => (
                <tr key={p.id} className="text-slate-700 dark:text-slate-300">
                  <td className="py-3 pr-4 font-semibold">{p.socio}</td>
                  <td className="py-3 pr-4 text-slate-500 dark:text-slate-400 max-w-[200px] truncate">{p.libro}</td>
                  <td className="py-3 pr-4 text-rose-600 font-semibold">
                    {new Date(p.fechaVencimiento).toLocaleDateString('es-AR')}
                  </td>
                  <td className="py-3 text-right">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 font-bold text-xs">
                      {p.diasAtraso} día{p.diasAtraso !== 1 ? 's' : ''}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex items-center justify-center gap-3 py-12 text-emerald-600 dark:text-emerald-400">
          <Library size={24} />
          <p className="font-bold">¡Todo al día! No hay vencidos</p>
        </div>
      ),
    },
    {
      id: 'inventario',
      title: 'Inventario',
      icon: <Package className="text-amber-600" size={24} />,
      description: 'Ejemplares por ubicación y tipo',
      content: data ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4 flex items-center gap-2">
              <MapPin size={14} /> Ubicación
            </h4>
            <div className="h-48">
              <Doughnut
                data={{
                  labels: data.inventarioPorUbicacion.map((u) => u.ubicacion),
                  datasets: [{
                    data: data.inventarioPorUbicacion.map((u) => u.cantidad),
                    backgroundColor: COLORS,
                  }],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'right' as const,
                      labels: { boxWidth: 12, padding: 8, font: { size: 11 } },
                    },
                  },
                }}
              />
            </div>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4 flex items-center gap-2">
              <Package size={14} /> Tipo de Material
            </h4>
            <div className="h-48">
              <Doughnut
                data={{
                  labels: data.inventarioPorTipo.map((t) => t.tipo),
                  datasets: [{
                    data: data.inventarioPorTipo.map((t) => t.cantidad),
                    backgroundColor: COLORS,
                  }],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'right' as const,
                      labels: { boxWidth: 12, padding: 8, font: { size: 11 } },
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>
      ) : null,
    },
    {
      id: 'nuevos-socios',
      title: 'Nuevos Socios',
      icon: <TrendingUp className="text-sky-600" size={24} />,
      description: 'Altas de socios por mes',
      content: data && (
        <div className="h-64">
          <Line
            data={{
              labels: data.nuevosSociosPorPeriodo.map((s) => s.periodo),
              datasets: [{
                label: 'Nuevos socios',
                data: data.nuevosSociosPorPeriodo.map((s) => s.cantidad),
                borderColor: '#0ea5e9',
                backgroundColor: 'rgba(14, 165, 233, 0.1)',
                fill: true,
                tension: 0.3,
                pointBackgroundColor: '#0ea5e9',
                pointRadius: 4,
              }],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: {
                y: { beginAtZero: true, ticks: { stepSize: 1 } },
                x: { grid: { display: false } },
              },
            }}
          />
        </div>
      ),
    },
    {
      id: 'catalogo',
      title: 'Catálogo',
      icon: <Globe className="text-cyan-600" size={24} />,
      description: 'Distribución por año, editorial e idioma',
      content: data ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4">Año</h4>
            <div className="h-48">
              <Bar
                data={{
                  labels: data.catalogoPorAnio.slice(0, 10).map((a) => a.anio),
                  datasets: [{
                    label: 'Libros',
                    data: data.catalogoPorAnio.slice(0, 10).map((a) => a.cantidad),
                    backgroundColor: '#06b6d4',
                    borderRadius: 4,
                  }],
                }}
                options={{
                  indexAxis: 'y' as const,
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: {
                    x: { beginAtZero: true, ticks: { stepSize: 1 } },
                    y: { grid: { display: false } },
                  },
                }}
              />
            </div>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4">
              <Building2 size={14} className="inline mr-1" /> Editorial
            </h4>
            <div className="h-48">
              <Bar
                data={{
                  labels: data.catalogoPorEditorial.map((e) =>
                    e.editorial.length > 15 ? e.editorial.slice(0, 15) + '…' : e.editorial
                  ),
                  datasets: [{
                    label: 'Libros',
                    data: data.catalogoPorEditorial.map((e) => e.cantidad),
                    backgroundColor: data.catalogoPorEditorial.map((_, i) => COLORS[i % COLORS.length]),
                    borderRadius: 4,
                  }],
                }}
                options={{
                  indexAxis: 'y' as const,
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: {
                    x: { beginAtZero: true, ticks: { stepSize: 1 } },
                    y: { grid: { display: false } },
                  },
                }}
              />
            </div>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4">Idioma</h4>
            <div className="h-48">
              <Pie
                data={{
                  labels: data.catalogoPorIdioma.map((i) => i.idioma),
                  datasets: [{
                    data: data.catalogoPorIdioma.map((i) => i.cantidad),
                    backgroundColor: COLORS,
                  }],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'right' as const,
                      labels: { boxWidth: 12, padding: 6, font: { size: 10 } },
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>
      ) : null,
    },
    {
      id: 'comparativa',
      title: 'Préstamos: Activos vs En Mora',
      icon: <BarChartIcon className="text-indigo-600" size={24} />,
      description: 'Comparativa de estado actual',
      content: data && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 items-center">
          <div className="h-56">
            <Doughnut
              data={{
                labels: ['Activos', 'En mora'],
                datasets: [{
                  data: [data.prestamosActivosVsDevueltos.activos, data.prestamosActivosVsDevueltos.enMora],
                  backgroundColor: ['#6366f1', '#ef4444'],
                  borderWidth: 0,
                }],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom' as const,
                    labels: { boxWidth: 12, padding: 16, font: { size: 13, weight: 'bold' as const } },
                  },
                },
              }}
            />
          </div>
          <div className="space-y-6">
            <div className="bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl p-6">
              <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Activos</p>
              <p className="text-4xl font-black text-indigo-700 dark:text-indigo-300 mt-1">
                {data.prestamosActivosVsDevueltos.activos}
              </p>
            </div>
            <div className="bg-rose-50 dark:bg-rose-500/10 rounded-2xl p-6">
              <p className="text-sm font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">En mora</p>
              <p className="text-4xl font-black text-rose-700 dark:text-rose-300 mt-1">
                {data.prestamosActivosVsDevueltos.enMora}
              </p>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <MainLayout title="Reportes">
      <div className="space-y-8">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white font-display">
              Reportes
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-semibold mt-1">
              Analítica y estadísticas de la biblioteca
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Desde</label>
              <input
                type="date"
                value={fechaDesde}
                onChange={(e) => setFechaDesde(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Hasta</label>
              <input
                type="date"
                value={fechaHasta}
                onChange={(e) => setFechaHasta(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </header>

        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-slate-800 rounded-[2rem] border border-slate-100 dark:border-slate-700 p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 skeleton rounded-xl" />
                  <div className="h-6 w-40 skeleton rounded-xl" />
                </div>
                <div className="h-4 w-56 skeleton rounded-lg mb-6" />
                <div className="h-64 skeleton rounded-2xl" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {reportCards.map((card) => (
              <div
                key={card.id}
                className="bg-white dark:bg-slate-800 rounded-[2rem] border border-slate-100 dark:border-slate-700 p-8 shadow-sm hover:shadow-xl transition-shadow"
              >
                <div className="flex items-center gap-3 mb-1">
                  {card.icon}
                  <h2 className="text-xl font-black text-slate-900 dark:text-white font-display">
                    {card.title}
                  </h2>
                </div>
                <p className="text-sm font-semibold text-slate-400 dark:text-slate-500 mb-6">
                  {card.description}
                </p>
                {card.content}
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
