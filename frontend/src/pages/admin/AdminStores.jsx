import { useEffect, useState } from 'react';
import { Container, Table, Button, Form, Modal, Row, Col, Alert } from 'react-bootstrap';
import api from '../../api/axios';

const AdminStores = () => {
  const [stores, setStores] = useState([]);
  const [owners, setOwners] = useState([]);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');
  
  const [showModal, setShowModal] = useState(false);
  const [newStore, setNewStore] = useState({ name: '', email: '', address: '', ownerId: '' });
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      const storesRes = await api.get('/admin/stores', {
        params: { search, sortBy }
      });
      setStores(storesRes.data);

      const ownersRes = await api.get('/admin/users', {
        params: { role: 'STORE_OWNER' }
      });
      setOwners(ownersRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search, sortBy]);

  const handleCreateStore = async (e) => {
    e.preventDefault();
    setError('');

    if (newStore.name.length < 3) return setError('Name too short');
    if (newStore.address.length > 400) return setError('Address max 400 chars');

    try {
      await api.post('/admin/stores', newStore);
      setShowModal(false);
      setNewStore({ name: '', email: '', address: '', ownerId: '' });
      fetchData();
    } catch (err) {
      setError('Failed to create store. Ensure email is unique.');
    }
  };

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Store Management</h2>
        <Button onClick={() => setShowModal(true)}>+ Add Store</Button>
      </div>

      <Row className="mb-3">
        <Col md={6}>
          <Form.Control 
            placeholder="Search Stores..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </Col>
        <Col md={3}>
           <Form.Select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
             <option value="name">Sort by Name</option>
             <option value="address">Sort by Address</option>
           </Form.Select>
        </Col>
      </Row>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Address</th>
            <th>Rating</th>
            <th>Reviews</th>
          </tr>
        </thead>
        <tbody>
          {stores.map(store => (
            <tr key={store.id}>
              <td>{store.name}</td>
              <td>{store.email}</td>
              <td>{store.address}</td>
              <td>
                <span className={store.rating > 0 ? "fw-bold text-warning" : "text-muted"}>
                  ★ {store.rating}
                </span>
              </td>
              <td>{store.totalRatings}</td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Store</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleCreateStore}>
            <Form.Group className="mb-3">
              <Form.Label>Store Name</Form.Label>
              <Form.Control 
                required 
                value={newStore.name}
                onChange={(e) => setNewStore({...newStore, name: e.target.value})}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Store Email</Form.Label>
              <Form.Control 
                type="email" 
                required 
                value={newStore.email}
                onChange={(e) => setNewStore({...newStore, email: e.target.value})}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Address</Form.Label>
              <Form.Control 
                as="textarea"
                required 
                value={newStore.address}
                onChange={(e) => setNewStore({...newStore, address: e.target.value})}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Assign Owner</Form.Label>
              <Form.Select 
                value={newStore.ownerId}
                onChange={(e) => setNewStore({...newStore, ownerId: e.target.value})}
              >
                <option value="">Select a Store Owner...</option>
                {owners.map(owner => (
                  <option key={owner.id} value={owner.id}>
                    {owner.name} ({owner.email})
                  </option>
                ))}
              </Form.Select>
              <Form.Text className="text-muted">
                Only users with "Store Owner" role appear here.
              </Form.Text>
            </Form.Group>
            <Button variant="primary" type="submit">Create Store</Button>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default AdminStores;