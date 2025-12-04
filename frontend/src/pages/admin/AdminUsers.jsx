import { useEffect, useState } from 'react';
import { Container, Table, Button, Form, Modal, Row, Col, Badge, Alert } from 'react-bootstrap';
import api from '../../api/axios';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [order, setOrder] = useState('ASC');
  
  const [showModal, setShowModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', address: '', role: 'NORMAL_USER' });
  const [error, setError] = useState('');

  const fetchUsers = async () => {
    try {
      const params = {
        search,
        role: filterRole,
        sortBy,
        order
      };
      const { data } = await api.get('/admin/users', { params });
      setUsers(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchUsers();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [search, filterRole, sortBy, order]);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setError('');

    if (newUser.name.length < 20 || newUser.name.length > 60) {
      return setError('Name must be between 20 and 60 characters');
    }
    if (newUser.password.length < 8 || newUser.password.length > 16) {
      return setError('Password must be 8-16 characters');
    }

    try {
      await api.post('/admin/users', newUser);
      setShowModal(false);
      setNewUser({ name: '', email: '', password: '', address: '', role: 'NORMAL_USER' });
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create user');
    }
  };

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>User Management</h2>
        <Button onClick={() => setShowModal(true)}>+ Add User</Button>
      </div>

      <Row className="mb-3">
        <Col md={4}>
          <Form.Control 
            placeholder="Search Name, Email, Address..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </Col>
        <Col md={3}>
          <Form.Select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
            <option value="">All Roles</option>
            <option value="ADMIN">Admin</option>
            <option value="STORE_OWNER">Store Owner</option>
            <option value="NORMAL_USER">Normal User</option>
          </Form.Select>
        </Col>
        <Col md={3}>
          <Form.Select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="name">Sort by Name</option>
            <option value="email">Sort by Email</option>
            <option value="role">Sort by Role</option>
          </Form.Select>
        </Col>
        <Col md={2}>
           <Button variant="outline-secondary" onClick={() => setOrder(order === 'ASC' ? 'DESC' : 'ASC')}>
             {order}
           </Button>
        </Col>
      </Row>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Address</th>
            <th>Role</th>
            <th>Rating (If Owner)</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td style={{maxWidth: '200px'}} className="text-truncate">{user.address}</td>
              <td>
                <Badge bg={user.role === 'ADMIN' ? 'danger' : user.role === 'STORE_OWNER' ? 'warning' : 'primary'}>
                  {user.role}
                </Badge>
              </td>
              <td>{user.role === 'STORE_OWNER' && user.storeRating ? `${user.storeRating} / 5` : '-'}</td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add New User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleCreateUser}>
            <Form.Group className="mb-3">
              <Form.Label>Name (20-60 chars)</Form.Label>
              <Form.Control 
                required 
                value={newUser.name}
                onChange={(e) => setNewUser({...newUser, name: e.target.value})}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control 
                type="email" 
                required 
                value={newUser.email}
                onChange={(e) => setNewUser({...newUser, email: e.target.value})}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control 
                type="password" 
                required 
                value={newUser.password}
                onChange={(e) => setNewUser({...newUser, password: e.target.value})}
              />
              <Form.Text>Must contain UpperCase & Special Char</Form.Text>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Address</Form.Label>
              <Form.Control 
                as="textarea"
                required 
                value={newUser.address}
                onChange={(e) => setNewUser({...newUser, address: e.target.value})}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Role</Form.Label>
              <Form.Select 
                value={newUser.role}
                onChange={(e) => setNewUser({...newUser, role: e.target.value})}
              >
                <option value="NORMAL_USER">Normal User</option>
                <option value="STORE_OWNER">Store Owner</option>
                <option value="ADMIN">System Administrator</option>
              </Form.Select>
            </Form.Group>
            <Button variant="primary" type="submit">Create User</Button>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default AdminUsers;