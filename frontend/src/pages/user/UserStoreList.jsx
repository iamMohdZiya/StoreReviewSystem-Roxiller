import { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Badge } from 'react-bootstrap';
import api from '../../api/axios';
import { toast } from 'react-toastify';

const UserStoreList = () => {
  const [stores, setStores] = useState([]);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [order, setOrder] = useState('ASC');
  
  // State to track "draft" ratings (what the user selected but hasn't submitted yet)
  const [selectedRatings, setSelectedRatings] = useState({});

  const fetchStores = async () => {
    try {
      const { data } = await api.get('/users/stores', {
        params: { search, sortBy, order }
      });
      setStores(data);
    } catch (error) {
      console.error('Failed to fetch stores');
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchStores();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [search, sortBy, order]);

  // Handle selecting a star (updates UI only, does not submit)
  const handleSelectRating = (storeId, score) => {
    setSelectedRatings(prev => ({
      ...prev,
      [storeId]: score
    }));
  };

  // Handle the actual Submit button click
  const handleSubmitClick = async (storeId) => {
    const score = selectedRatings[storeId];
    
    if (!score) {
      return toast.warning('Please select a star rating first.');
    }

    try {
      await api.post('/users/rating', { storeId, score });
      toast.success('Rating submitted successfully!');
      
      // Clear the draft selection for this store since it's now saved
      setSelectedRatings(prev => {
        const newState = { ...prev };
        delete newState[storeId];
        return newState;
      });
      
      fetchStores(); // Refresh to show updated average and confirmed user rating
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit rating');
    }
  };

  return (
    <Container className="mt-4">
      <h2 className="mb-4">All Stores</h2>
      
      {/* Filters */}
      <Row className="mb-4">
        <Col md={5}>
          <Form.Control 
            placeholder="Search by Name or Address..." 
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
        <Col md={2}>
           <Button variant="outline-secondary" onClick={() => setOrder(order === 'ASC' ? 'DESC' : 'ASC')}>
             {order === 'ASC' ? 'Ascending' : 'Descending'}
           </Button>
        </Col>
      </Row>

      {/* Store List Grid */}
      <Row>
        {stores.map(store => {
          // Determine what rating to show: The draft selection OR the saved DB rating
          const currentRating = selectedRatings[store.id] || store.myRating || 0;

          return (
            <Col key={store.id} md={6} lg={4} className="mb-4">
              <Card className="h-100 shadow-sm">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <Card.Title>{store.name}</Card.Title>
                    <Badge bg="warning" text="dark" className="fs-6">
                      ★ {store.overallRating}
                    </Badge>
                  </div>
                  <Card.Text className="text-muted mb-4">
                    <small>{store.address}</small>
                  </Card.Text>
                  
                  <hr />
                  
                  <h6>Rate this Store:</h6>
                  <div className="d-flex justify-content-between mb-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Button
                        key={star}
                        // Fill star if it's less than or equal to current selection
                        variant={currentRating >= star ? "warning" : "outline-secondary"}
                        size="sm"
                        className="rounded-circle p-2"
                        style={{ width: '35px', height: '35px', lineHeight: '1', fontWeight: 'bold' }}
                        onClick={() => handleSelectRating(store.id, star)}
                      >
                        {star}
                      </Button>
                    ))}
                  </div>

                  {/* New Submit Button */}
                  <div className="d-grid gap-2">
                    <Button 
                      variant="primary" 
                      onClick={() => handleSubmitClick(store.id)}
                      disabled={!selectedRatings[store.id]} // Disable if user hasn't selected a new rating
                    >
                      Submit Rating
                    </Button>
                  </div>

                  {store.myRating && !selectedRatings[store.id] && (
                    <div className="text-center mt-2 text-success">
                      <small>Current recorded rating: {store.myRating} stars</small>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          );
        })}
        {stores.length === 0 && (
          <Col className="text-center mt-5">
            <h4>No stores found matching your criteria.</h4>
          </Col>
        )}
      </Row>
    </Container>
  );
};

export default UserStoreList;