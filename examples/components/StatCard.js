import { Component } from '../../index.js';

// Reusable component: StatCard
export class StatCard extends Component {
  constructor() {
    super(null, {
      title: '',
      value: '',
      icon: '',
      color: 'blue',
      trend: null // { direction: 'up|down', value: number }
    });
  }

  setProps(props) {
    super.setProps(props);
  }

  template() {
    const colorMap = {
      blue: { bg: '#eff6ff', border: '#dbeafe', text: '#1e40af' },
      green: { bg: '#f0fdf4', border: '#dcfce7', text: '#166534' },
      red: { bg: '#fef2f2', border: '#fecaca', text: '#dc2626' },
      yellow: { bg: '#fefce8', border: '#fef08a', text: '#ca8a04' }
    };

    const colors = colorMap[this.props.color] || colorMap.blue;

    return this.html`
      <div style="padding: 1.25rem; background: ${colors.bg}; border: 1px solid ${colors.border}; border-radius: 8px; transition: all 200ms ease;">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <div>
            <div style="font-size: 0.875rem; font-weight: 500; color: #6b7280; margin-bottom: 0.25rem;">${this.props.title}</div>
            <div style="font-size: 1.5rem; font-weight: 700; color: ${colors.text};">${this.props.value}</div>
          </div>

          ${this.props.icon ? this.html`
            <div style="font-size: 2rem; color: ${colors.text};">${this.props.icon}</div>
          ` : ''}
        </div>

        ${this.props.trend ? this.html`
          <div style="margin-top: 0.75rem; display: flex; align-items: center; gap: 0.25rem;">
            <span style="color: ${this.props.trend.direction === 'up' ? '#059669' : '#dc2626'}; font-size: 0.875rem;">
              ${this.props.trend.direction === 'up' ? '↗' : '↘'} ${this.props.trend.value}%
            </span>
          </div>
        ` : ''}
      </div>
    `;
  }
}
