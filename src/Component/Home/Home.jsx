import { useEffect, useState, useCallback } from 'react';
import { Row, Col, Card, Spin, Typography, message, Input, Pagination } from 'antd';

const { Title } = Typography;
const { Search } = Input;

// ✅ Custom debounce function
function debounce(func, delay) {
  let timer;
  return function (...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

const Home = () => {
  const [pokemonList, setPokemonList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [searchText, setSearchText] = useState('');
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20); // keep default 20 per page
  const [total, setTotal] = useState(0);

  // ✅ API to fetch a page of Pokémon (uses limit & offset)
  const fetchPokemons = async (page = 1) => {
    setLoading(true);
    try {
      const offset = (page - 1) * pageSize;
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${pageSize}&offset=${offset}`);
      const data = await response.json();

      // update total count for pagination
      if (typeof data.count === 'number') setTotal(data.count);

      const detailedData = await Promise.all(
        data.results.map(async (pokemon) => {
          const res = await fetch(pokemon.url);
          return res.json();
        })
      );

      setPokemonList(detailedData);
      setNotFound(false);
    } catch (error) {
      message.error('Failed to load Pokémon list');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ API to fetch by name
  const fetchPokemonByName = async (name) => {
    setLoading(true);
    try {
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name.toLowerCase()}`);
      if (!response.ok) {
        setNotFound(true);
        setPokemonList([]);
        return;
      }
      const data = await response.json();
      setPokemonList([data]);
      setNotFound(false);
    } catch (error) {
      message.error('Failed to search Pokémon');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Effect: fetch list or search result
  useEffect(() => {
    if (searchText === '') {
      // when clearing search, reset to first page and fetch
      setCurrentPage(1);
      fetchPokemons(1);
    } else {
      fetchPokemonByName(searchText);
    }
  }, [searchText]);

  // fetch when currentPage changes (only when not searching)
  useEffect(() => {
    if (searchText === '') {
      fetchPokemons(currentPage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  // ✅ Debounced handler only updates `searchText`
  const debouncedSearch = useCallback(
    debounce((val) => {
      setSearchText(val.trim());
    }, 500),
    []
  );

  const onSearchChange = (e) => {
    debouncedSearch(e.target.value);
  };

  return (
    <div className="home-page">
      <Title level={2} className="home-title">Pokémon Gallery</Title>

      <div className="search-box">
        <Search
          placeholder="Search Pokémon by name"
          allowClear
          onChange={onSearchChange}
          style={{ maxWidth: 400 }}
        />
      </div>

      {loading ? (
        <div className="spinner">
          <Spin size="large" />
        </div>
      ) : notFound ? (
        <p style={{ textAlign: 'center' }}>No Pokémon found.</p>
      ) : (
        <Row gutter={[16, 16]}>
          {pokemonList.map((pokemon) => (
            <Col xs={24} sm={12} md={8} lg={6} key={pokemon.id}>
              <Card
                hoverable
                title={pokemon.name.toUpperCase()}
                cover={
                  <img
                    alt={pokemon.name}
                    src={pokemon.sprites.other['official-artwork'].front_default}
                    style={{ height: 200, objectFit: 'contain' }}
                  />
                }
              >
                <p><strong>ID:</strong> {pokemon.id}</p>
                <p><strong>Type:</strong> {pokemon.types.map(t => t.type.name).join(', ')}</p>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Show pagination only when not searching */}
      {searchText === '' && !loading && !notFound && (
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={total}
            onChange={(page) => setCurrentPage(page)}
            showSizeChanger={false}
          />
        </div>
      )}
    </div>
  );
};

export default Home;
