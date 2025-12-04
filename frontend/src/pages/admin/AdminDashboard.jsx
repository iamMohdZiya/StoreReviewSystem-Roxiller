import { useEffect, useState } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import api from '../../api/axios';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ totalUsers: 0, totalStores: 0, totalRatings: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/admin/dashboard');
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch stats');
      }
    };
    fetchStats();
  }, []);

  return (
    <Container className="mt-4">
      <h2 className="mb-4">System Overview</h2>
      <Row>
        <Col md={4}>
          <Card className="text-white bg-primary mb-3">
            <Card.Header>Total Users</Card.Header>
            <Card.Body>
              <Card.Title className="display-4">{stats.totalUsers}</Card.Title>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-white bg-success mb-3">
            <Card.Header>Total Stores</Card.Header>
            <Card.Body>
              <Card.Title className="display-4">{stats.totalStores}</Card.Title>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-white bg-info mb-3">
            <Card.Header>Total Ratings Submitted</Card.Header>
            <Card.Body>
              <Card.Title className="display-4">{stats.totalRatings}</Card.Title>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminDashboard;