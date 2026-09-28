"""Smoke tests for every endpoint group (run against seeded nestai.db).

    .venv/bin/python -m pytest tests/ -q
"""

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)

FRONTEND_KEYS = {
    'id', 'title', 'location', 'city', 'price', 'type', 'bedrooms', 'bathrooms',
    'area', 'latitude', 'longitude', 'image', 'amenities', 'matchScore',
    'personas', 'distanceToWork', 'distanceToCollege', 'rating', 'furnished',
    'description', 'recommendationReasons',
}


def test_health():
    r = client.get('/health')
    assert r.status_code == 200 and r.json()['status'] == 'ok'


def test_list_properties_shape():
    r = client.get('/api/properties?limit=5')
    assert r.status_code == 200
    rows = r.json()
    assert len(rows) == 5
    assert FRONTEND_KEYS <= set(rows[0].keys()), set(rows[0].keys()) ^ FRONTEND_KEYS


def test_list_filters_and_sort():
    r = client.get('/api/properties?max_price=25000&sort=price-asc&limit=50')
    rows = r.json()
    assert rows and all(p['price'] <= 25000 for p in rows)
    assert [p['price'] for p in rows] == sorted(p['price'] for p in rows)
    r = client.get('/api/properties?search=Powai')
    assert r.json() and all('powai' in (p['title'] + p['location']).lower() for p in r.json())


def test_get_property_and_404():
    pid = client.get('/api/properties?limit=1').json()[0]['id']
    assert client.get(f'/api/properties/{pid}').status_code == 200
    assert client.get('/api/properties/nope').status_code == 404


def test_recommendations_all_personas():
    for persona in ['student', 'professional', 'family', 'senior']:
        r = client.post('/api/recommendations', json={
            'persona': persona,
            'filters': {'minPrice': 0, 'maxPrice': 100000, 'types': [],
                        'bedrooms': [], 'location': '', 'amenities': [], 'personas': []},
            'searchQuery': '',
        })
        assert r.status_code == 200, (persona, r.text)
        rows = r.json()
        assert rows, persona
        scores = [p['matchScore'] for p in rows]
        assert scores == sorted(scores, reverse=True), persona
        assert all(0 <= s <= 100 for s in scores)
        assert all(p['recommendationReasons'].get(persona) for p in rows)


def test_recommendations_differ_by_persona():
    tops = set()
    for persona in ['student', 'professional', 'family', 'senior']:
        r = client.post('/api/recommendations', json={
            'persona': persona,
            'filters': {'minPrice': 0, 'maxPrice': 100000, 'types': [],
                        'bedrooms': [], 'location': '', 'amenities': [], 'personas': []},
            'searchQuery': ''})
        tops.add(r.json()[0]['id'])
    assert len(tops) >= 2  # persona weighting visibly re-ranks


def test_liveability():
    pid = client.get('/api/properties?limit=1').json()[0]['id']
    r = client.get(f'/api/properties/{pid}/liveability')
    assert r.status_code == 200
    body = r.json()
    assert set(body['dimensions']) == {'transport', 'education', 'healthcare', 'shopping', 'environment'}
    assert 0 <= body['overall'] <= 100
    # second call served from cache
    assert client.get(f'/api/properties/{pid}/liveability').json()['cached'] is True


def test_commute_and_affordability():
    r = client.post('/api/commute', json={
        'originLat': 19.0596, 'originLng': 72.8295,
        'destLat': 19.0626, 'destLng': 72.8656})
    assert r.status_code == 200
    assert set(r.json()['modes']) == {'driving', 'walking', 'transit'}
    assert all(v['durationMin'] > 0 for v in r.json()['modes'].values())

    r = client.post('/api/affordability', json={'monthlyIncome': 80000, 'price': 24000})
    assert r.json()['band'] == 'Affordable'
    r = client.post('/api/affordability', json={'monthlyIncome': 40000, 'price': 30000})
    assert r.json()['band'] == 'Over Budget'


def test_compare_and_trends():
    ids = [p['id'] for p in client.get('/api/properties?limit=3').json()]
    r = client.post('/api/compare', json={'ids': ids, 'persona': 'family', 'monthlyIncome': 100000})
    assert r.status_code == 200 and len(r.json()['items']) == 3
    assert client.post('/api/compare', json={'ids': ids * 2}).status_code == 422

    r = client.get('/api/trends?localities=Powai,Bandra West')
    assert r.status_code == 200 and len(r.json()) == 2
    assert len(r.json()[0]['points']) == 12
    assert [p['month'] for p in r.json()[0]['points']] == sorted(p['month'] for p in r.json()[0]['points'])
