import { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Table, Alert } from 'react-bootstrap';
import api from '../../api/axios';

const OwnerDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/owner/dashboard');
        setData(response.data);
      } catch (err) {
        if (err.response && err.response.status === 404) {
          setError('No store has been assigned to your account yet. Please contact the Administrator.');
        } else {
          setError('Failed to load dashboard data.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <Container className="mt-5"><p>Loading...</p></Container>;

  if (error) return (
    <Container className="mt-5">
      <Alert variant="warning">{error}</Alert>
    </Container>
  );

  return (
    <Container className="mt-4">
      <div className="mb-4">
        <h2>{data.storeName}</h2>
        <p className="text-muted">{data.address}</p>
      </div>

      <Row className="mb-4">
        <Col md={6}>
          <Card className="text-center h-100 border-warning">
            <Card.Body>
              <h6 className="text-muted">Average Rating</h6>
              <h1 className="display-4 text-warning fw-bold">{data.averageRating} <span className="fs-6 text-muted">/ 5</span></h1>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="text-center h-100 border-primary">
            <Card.Body>
              <h6 className="text-muted">Total Reviews</h6>
              <h1 className="display-4 text-primary fw-bold">{data.totalRatings}</h1>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <h4 className="mb-3">Customer Ratings</h4>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Customer Name</th>
            <th>Email</th>
            <th>Rating</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {data.ratings.length > 0 ? (
            data.ratings.map((rating, index) => (
              <tr key={index}>
                <td>{rating.userName}</td>
                <td>{rating.email}</td>
                <td>
                  <span className={rating.score >= 4 ? 'text-success fw-bold' : rating.score <= 2 ? 'text-danger fw-bold' : 'text-dark'}>
                    {rating.score} / 5
                  </span>
                </td>
                <td>{new Date(rating.date).toLocaleDateString()}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="text-center">No ratings received yet.</td>
            </tr>
          )}
        </tbody>
      </Table>
    </Container>
  );
};

export default OwnerDashboard;