import { Component } from '../../index.js';

// Reusable component: DataTable
export class DataTable extends Component {
  constructor() {
    super(null, {
      columns: [],
      data: [],
      sortable: false,
      selectable: false,
      selectedRows: new Set(),
      sortBy: null,
      sortDirection: 'asc'
    });
  }

  setProps(props) {
    super.setProps(props);
  }

  onCreate() {
    if (this.props.sortable) {
      this.props.columns.forEach(col => {
        if (col.sortable) {
          this.on('click', `#sort-${col.key}`, () => this.sortBy(col.key));
        }
      });
    }

    if (this.props.selectable) {
      this.on('change', '.row-checkbox', (e) => {
        const id = e.target.value;
        if (e.target.checked) {
          this.props.selectedRows.add(id);
        } else {
          this.props.selectedRows.delete(id);
        }
        this.render();
      });
    }
  }

  sortBy(key) {
    const direction = this.props.sortBy === key && this.props.sortDirection === 'asc' ? 'desc' : 'asc';
    this.setState({ sortBy: key, sortDirection: direction });
  }

  getSortedData() {
    if (!this.props.sortBy) return this.props.data;

    return [...this.props.data].sort((a, b) => {
      const aVal = a[this.props.sortBy];
      const bVal = b[this.props.sortBy];

      if (this.props.sortDirection === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
  }

  template() {
    const sortedData = this.getSortedData();

    return this.html`
      <div style="border: 1px solid var(--border); border-radius: 8px; overflow: hidden;">
        <table style="width: 100%;">
          <thead style="background: var(--bg); border-bottom: 1px solid var(--border);">
            <tr>
              ${this.props.selectable ? this.html`
                <th style="padding: 0.75rem 1rem; text-align: left; font-size: 0.75rem; font-weight: 500; color: var(--muted); text-transform: uppercase; letter-spacing: 0.05em;">
                  <input type="checkbox" class="select-all">
                </th>
              ` : ''}

              ${this.props.columns.map(col => this.html`
                <th style="padding: 0.75rem 1rem; text-align: left; font-size: 0.75rem; font-weight: 500; color: var(--muted); text-transform: uppercase; letter-spacing: 0.05em;">
                  ${col.sortable ? this.html`
                    <button
                      id="sort-${col.key}"
                      style="display: flex; align-items: center; gap: 0.25rem; background: none; border: none; cursor: pointer; color: inherit; font: inherit;"
                    >
                      ${col.label}
                      ${this.props.sortBy === col.key ? this.html`
                        <span>${this.props.sortDirection === 'asc' ? '↑' : '↓'}</span>
                      ` : ''}
                    </button>
                  ` : col.label}
                </th>
              `).join('')}
            </tr>
          </thead>

          <tbody style="background: var(--card);">
            ${sortedData.length === 0 ? this.html`
              <tr>
                <td
                  colspan="${this.props.columns.length + (this.props.selectable ? 1 : 0)}"
                  style="padding: 2rem 1rem; text-align: center; color: var(--muted);"
                >
                  No data available
                </td>
              </tr>
            ` : sortedData.map((row, index) => this.html`
              <tr data-key="${row.id || index}" style="border-bottom: 1px solid var(--border);">
                ${this.props.selectable ? this.html`
                  <td style="padding: 1rem; white-space: nowrap;">
                    <input
                      type="checkbox"
                      class="row-checkbox"
                      value="${row.id || index}"
                      ${this.props.selectedRows.has(row.id || index) ? 'checked' : ''}
                    >
                  </td>
                ` : ''}

                ${this.props.columns.map(col => this.html`
                  <td style="padding: 1rem; white-space: nowrap; font-size: 0.875rem; color: var(--text);">
                    ${col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                `).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }
}
