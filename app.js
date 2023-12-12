const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

app.use(bodyParser.json());

const customers = require('./customers.json');

app.get('/customers/:id', (req, res) => {
  const customerId = parseInt(req.params.id);
  const customer = customers.find(c => c.id === customerId);

  if (!customer) {
    return res.status(404).json({ error: 'Customer not found' });
  }

  res.json(customer);
});

app.get('/customers', (req, res) => {
  const { first_name, last_name, city, page = 1, limit = 10 } = req.query;

  let filteredCustomers = customers;

  if (first_name) {
    filteredCustomers = filteredCustomers.filter(c => c.first_name.includes(first_name));
  }

  if (last_name) {
    filteredCustomers = filteredCustomers.filter(c => c.last_name.includes(last_name));
  }

  if (city) {
    filteredCustomers = filteredCustomers.filter(c => c.city.includes(city));
  }

  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  const paginatedCustomers = filteredCustomers.slice(startIndex, endIndex);

  res.json({ total: filteredCustomers.length, customers: paginatedCustomers });
});

app.get('/unique-cities', (req, res) => {
  const uniqueCities = [...new Set(customers.map(c => c.city))];
  const citiesWithCount = uniqueCities.map(city => ({
    city,
    count: customers.filter(c => c.city === city).length
  }));

  res.json(citiesWithCount);
});

app.post('/add-customer', (req, res) => {
  const { id, first_name, last_name, city, company } = req.body;

  if (!id || !first_name || !last_name || !city || !company) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  if (!customers.find(c => c.city === city) || !customers.find(c => c.company === company)) {
    return res.status(400).json({ error: 'City or company does not exist for an existing customer' });
  }

  const newCustomer = { id, first_name, last_name, city, company };
  customers.push(newCustomer);

  res.json(newCustomer);
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
