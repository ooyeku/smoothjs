import { defineComponent } from '../../index.js';
import { DataTable } from '../components/DataTable.js';

export const DataTablePage = defineComponent(({ html, useState, on }) => {
  // Sample data for different table examples
  const sampleUsers = [
    { id: 1, name: 'Alice Johnson', email: 'alice@example.com', role: 'Admin', status: 'Active', joinDate: '2023-01-15', score: 95 },
    { id: 2, name: 'Bob Smith', email: 'bob@example.com', role: 'User', status: 'Active', joinDate: '2023-02-20', score: 87 },
    { id: 3, name: 'Carol Davis', email: 'carol@example.com', role: 'Moderator', status: 'Inactive', joinDate: '2023-03-10', score: 92 },
    { id: 4, name: 'David Wilson', email: 'david@example.com', role: 'User', status: 'Active', joinDate: '2023-04-05', score: 78 },
    { id: 5, name: 'Eva Brown', email: 'eva@example.com', role: 'Admin', status: 'Active', joinDate: '2023-05-12', score: 96 },
    { id: 6, name: 'Frank Miller', email: 'frank@example.com', role: 'User', status: 'Pending', joinDate: '2023-06-01', score: 83 },
    { id: 7, name: 'Grace Lee', email: 'grace@example.com', role: 'Moderator', status: 'Active', joinDate: '2023-07-18', score: 89 },
    { id: 8, name: 'Henry Taylor', email: 'henry@example.com', role: 'User', status: 'Inactive', joinDate: '2023-08-22', score: 74 }
  ];

  const sampleProducts = [
    { id: 1, name: 'Laptop Pro', category: 'Electronics', price: 1299.99, stock: 15, rating: 4.8 },
    { id: 2, name: 'Wireless Mouse', category: 'Accessories', price: 29.99, stock: 50, rating: 4.5 },
    { id: 3, name: 'Mechanical Keyboard', category: 'Accessories', price: 149.99, stock: 8, rating: 4.7 },
    { id: 4, name: 'Monitor 4K', category: 'Electronics', price: 399.99, stock: 12, rating: 4.6 },
    { id: 5, name: 'USB-C Hub', category: 'Accessories', price: 79.99, stock: 25, rating: 4.3 }
  ];

  const [selectedTable, setSelectedTable] = useState('users');
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [showFilters, setShowFilters] = useState(false);

  on('click', '#users-tab', () => setSelectedTable('users'));
  on('click', '#products-tab', () => setSelectedTable('products'));
  on('click', '#toggle-filters', () => setShowFilters(v => !v));

  // Column definitions for users table
  const userColumns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { 
      key: 'role', 
      label: 'Role', 
      sortable: true,
      render: (value) => html`<span class="badge badge-${value.toLowerCase()}">${value}</span>`
    },
    { 
      key: 'status', 
      label: 'Status', 
      sortable: true,
      render: (value) => html`<span class="status status-${value.toLowerCase()}">${value}</span>`
    },
    { key: 'joinDate', label: 'Join Date', sortable: true },
    { 
      key: 'score', 
      label: 'Score', 
      sortable: true,
      render: (value) => html`<div class="score-bar"><div class="score-fill" style="width: ${value}%"></div><span>${value}</span></div>`
    }
  ];

  // Column definitions for products table
  const productColumns = [
    { key: 'name', label: 'Product', sortable: true },
    { key: 'category', label: 'Category', sortable: true },
    { 
      key: 'price', 
      label: 'Price', 
      sortable: true,
      render: (value) => html`<span class="price">$${value.toFixed(2)}</span>`
    },
    { 
      key: 'stock', 
      label: 'Stock', 
      sortable: true,
      render: (value) => html`<span class="stock ${value < 10 ? 'low' : value < 20 ? 'medium' : 'high'}">${value}</span>`
    },
    { 
      key: 'rating', 
      label: 'Rating', 
      sortable: true,
      render: (value) => html`<div class="rating">${'★'.repeat(Math.floor(value))}${'☆'.repeat(5 - Math.floor(value))} ${value}</div>`
    }
  ];

  const currentData = selectedTable === 'users' ? sampleUsers : sampleProducts;
  const currentColumns = selectedTable === 'users' ? userColumns : productColumns;

  const render = () => html`
    <div class="page">
      <div class="container">
        <header class="page-header">
          <h1>DataTable Component Examples</h1>
          <p class="muted">Demonstrating the DataTable component with sorting, selection, and custom rendering.</p>
        </header>

        <div class="section">
          <div class="row" style="margin-bottom: 1rem;">
            <div class="tab-group">
              <button 
                id="users-tab" 
                class="tab ${selectedTable === 'users' ? 'active' : ''}"
                type="button"
              >
                Users (${sampleUsers.length})
              </button>
              <button 
                id="products-tab" 
                class="tab ${selectedTable === 'products' ? 'active' : ''}"
                type="button"
              >
                Products (${sampleProducts.length})
              </button>
            </div>
            <button 
              id="toggle-filters" 
              class="btn btn-outline"
              type="button"
            >
              ${showFilters ? 'Hide' : 'Show'} Filters
            </button>
          </div>

          ${showFilters ? html`
            <div class="card" style="margin-bottom: 1rem;">
              <div class="card-header">
                <h3>Table Filters</h3>
              </div>
              <div class="card-body">
                <div class="row">
                  <div class="col">
                    <label>Selected Rows: ${selectedRows.size}</label>
                    <div class="muted small">
                      ${selectedRows.size > 0 ? Array.from(selectedRows).join(', ') : 'None selected'}
                    </div>
                  </div>
                  <div class="col">
                    <label>Total Rows: ${currentData.length}</label>
                  </div>
                </div>
              </div>
            </div>
          ` : ''}

          <div class="card">
            <div class="card-header">
              <h3>${selectedTable === 'users' ? 'User Management' : 'Product Catalog'}</h3>
              <div class="muted small">
                ${selectedTable === 'users' 
                  ? 'Click column headers to sort. Use checkboxes to select rows.' 
                  : 'Product inventory with pricing and stock information.'
                }
              </div>
            </div>
            <div class="card-body" style="padding: 0;">
              <div id="datatable-container">
                <!-- DataTable will be mounted here -->
              </div>
            </div>
          </div>

          <div class="section">
            <h3>Features Demonstrated</h3>
            <div class="row">
              <div class="col">
                <h4>Sorting</h4>
                <ul class="list">
                  <li>Click column headers to sort</li>
                  <li>Visual indicators show sort direction</li>
                  <li>Supports string and numeric sorting</li>
                </ul>
              </div>
              <div class="col">
                <h4>Selection</h4>
                <ul class="list">
                  <li>Row-level checkboxes for selection</li>
                  <li>Track selected items in state</li>
                  <li>Bulk operations on selected data</li>
                </ul>
              </div>
              <div class="col">
                <h4>Custom Rendering</h4>
                <ul class="list">
                  <li>Custom cell renderers</li>
                  <li>Badges and status indicators</li>
                  <li>Progress bars and ratings</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>
        .tab-group {
          display: flex;
          border: 1px solid var(--border);
          border-radius: 6px;
          overflow: hidden;
        }
        
        .tab {
          padding: 0.5rem 1rem;
          background: var(--bg);
          border: none;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .tab:hover {
          background: var(--bg-hover);
        }
        
        .tab.active {
          background: var(--primary);
          color: white;
        }
        
        .badge {
          display: inline-block;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 500;
        }
        
        .badge-admin { background: #dc2626; color: white; }
        .badge-moderator { background: #d97706; color: white; }
        .badge-user { background: #059669; color: white; }
        
        .status {
          display: inline-block;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 500;
        }
        
        .status-active { background: #dcfce7; color: #166534; }
        .status-inactive { background: #fee2e2; color: #991b1b; }
        .status-pending { background: #fef3c7; color: #92400e; }
        
        .score-bar {
          position: relative;
          width: 60px;
          height: 20px;
          background: #e5e7eb;
          border-radius: 10px;
          overflow: hidden;
        }
        
        .score-fill {
          height: 100%;
          background: linear-gradient(90deg, #dc2626 0%, #f59e0b 50%, #059669 100%);
          transition: width 0.3s;
        }
        
        .score-bar span {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 0.75rem;
          font-weight: 500;
          color: white;
          text-shadow: 0 1px 2px rgba(0,0,0,0.5);
        }
        
        .price {
          font-weight: 600;
          color: var(--primary);
        }
        
        .stock {
          font-weight: 500;
        }
        
        .stock.low { color: #dc2626; }
        .stock.medium { color: #d97706; }
        .stock.high { color: #059669; }
        
        .rating {
          color: #f59e0b;
          font-size: 0.875rem;
        }
        
        .list {
          list-style: none;
          padding: 0;
        }
        
        .list li {
          padding: 0.25rem 0;
          position: relative;
          padding-left: 1rem;
        }
        
        .list li::before {
          content: '•';
          position: absolute;
          left: 0;
          color: var(--primary);
        }
      </style>
    </div>
  `;

  // Mount the DataTable component after the main component renders
  const onMount = () => {
    const container = document.getElementById('datatable-container');
    if (container) {
      const dataTable = new DataTable();
      dataTable.setProps({
        columns: currentColumns,
        data: currentData,
        sortable: true,
        selectable: selectedTable === 'users',
        selectedRows: selectedRows
      });
      dataTable.mount(container);
    }
  };

  return { render, onMount };
});
