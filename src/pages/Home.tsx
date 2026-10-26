import { IonCard, IonCardHeader, IonCardTitle, IonCardContent } from '@ionic/react';
import { Chart as ChartJS, ArcElement } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import AppShell from '../components/AppShell';
import '../theme/Inicio.css';

ChartJS.register(ArcElement);

const pieData = {
  labels: ['Utilizado', 'Disponible'],
  datasets: [
    {
      data: [32.3, 67.7],
      backgroundColor: ['#5ba3e6', '#1e4a8c'],
      borderWidth: 0,
    },
  ],
};

const pieOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: { enabled: false },
  },
};

const BARRAS = [
  { nombre: 'Mantenimiento', valor: 880000 },
  { nombre: 'Sueldos', valor: 760000 },
  { nombre: 'Proyectos', valor: 420000 },
];

const MAX_BARRA = 1_000_000;

const Home: React.FC = () => (
  <AppShell>
    <div className="inicio-panel home-grid">
      <IonCard className="inicio-card">
        <IonCardHeader>
          <IonCardTitle>Presupuesto contratos 2026</IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          <div className="pie-layout">
            <p className="pie-label pie-label-left">Disponible 67.7%</p>
            <div className="pie-canvas">
              <Pie data={pieData} options={pieOptions} />
            </div>
            <p className="pie-label pie-label-right">Utilizado 32.3%</p>
          </div>
          <p className="inicio-total">Presupuesto total $346.489.950.345</p>
        </IonCardContent>
      </IonCard>

      <IonCard className="inicio-card">
        <IonCardHeader>
          <IonCardTitle>Multas por categoría</IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          <div className="bars-chart">
            <div className="bars-y">
              <span>$1.000.000</span>
              <span>$750.000</span>
              <span>$500.000</span>
              <span>$250.000</span>
              <span>$0</span>
            </div>
            <div className="bars-plot">
              <div className="bars-grid">
                <i /><i /><i /><i /><i />
              </div>
              <div className="bars-row">
                {BARRAS.map((b) => (
                  <div key={b.nombre} className="bar-col">
                    <div
                      className="iso-bar"
                      style={{ height: `${(b.valor / MAX_BARRA) * 100}%` }}
                    >
                      <span className="iso-top" />
                      <span className="iso-side" />
                    </div>
                  </div>
                ))}
              </div>
              <div className="bars-x">
                {BARRAS.map((b) => (
                  <span key={b.nombre}>{b.nombre}</span>
                ))}
              </div>
            </div>
          </div>
        </IonCardContent>
      </IonCard>
    </div>
  </AppShell>
);

export default Home;
