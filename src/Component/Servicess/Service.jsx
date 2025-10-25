import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Table, Input, message, Spin, Drawer, Image, Tag, Row, Col, Card, Progress, Button } from 'antd';
import { useNavigate } from 'react-router-dom';

const { Search } = Input;

const Servicepage = () => {

  const [pokemonList, setPokemonList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
  });
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPokemons();
  }, []);

  const fetchPokemons = async () => {
    setLoading(true);
    try {
      // Get basic list
      const { data } = await axios.get('https://pokeapi.co/api/v2/pokemon?limit=50');
      // For each, get detail
      const detailed = await Promise.all(
        data.results.map(async (p) => {
          const res = await axios.get(p.url);
          return res.data;
        })
      );
      setPokemonList(detailed);
    } catch (error) {
      message.error('Failed to fetch Pokémon');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // useMemo for filtered data
  const filteredData = useMemo(() => {
    const lower = searchText.trim().toLowerCase();
    if (!lower) return pokemonList;
    return pokemonList.filter((p) => p.name.toLowerCase().includes(lower));
  }, [pokemonList, searchText]);

  // open / close drawer
  const openDrawer = (record) => {
    setSelectedPokemon(record);
    setDrawerVisible(true);
  };

  const closeDrawer = () => {
    setDrawerVisible(false);
    setSelectedPokemon(null);
  };

  // Table columns definition
  const columns = [
    {
      title: '',
      dataIndex: 'thumb',
      key: 'thumb',
      width: 80,
      render: (_, record) => (
        <div style={{ textAlign: 'center' }}>
          <img
            src={record.sprites?.other?.['official-artwork']?.front_default || record.sprites?.front_default}
            alt={record.name}
            width={64}
            style={{ cursor: 'pointer' }}
            onClick={(e) => { e.stopPropagation(); openDrawer(record); }}
          />
        </div>
      )
    },
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: '10%',
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: '30%',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (name, record) => (
        <a onClick={(e) => { e.stopPropagation(); openDrawer(record); }} style={{ color: '#1890ff' }}>{name}</a>
      )
    },
    {
      title: 'Height',
      dataIndex: 'height',
      key: 'height',
      width: '20%',
    },
    {
      title: 'Weight',
      dataIndex: 'weight',
      key: 'weight',
      width: '20%',
    },
  ];

  // Handle table change (pagination, sorting, etc.)
  const handleTableChange = (newPagination) => {
    setPagination(newPagination);
  };

  return (
    <div style={{ padding: 24 }}>
      <h1>Pokémon Table</h1>
      <Search
        placeholder="Search by name"
        style={{ width: 300, marginBottom: 16 }}
        onChange={(e) => {
          setSearchText(e.target.value);
          // Reset to first page on search
          setPagination((prev) => ({ ...prev, current: 1 }));
        }}
        allowClear
      />

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
          <Spin tip="Loading..." size="large" />
        </div>
      ) : (
        <>
          <Table
            columns={columns}
            dataSource={filteredData}
            rowKey="id"
            pagination={pagination}
            onChange={handleTableChange}
            onRow={(record) => ({
              onClick: () => openDrawer(record),
            })}
          />

          <Drawer
            title={selectedPokemon ? `${selectedPokemon.name.toUpperCase()} — #${String(selectedPokemon?.id).padStart(3, '0')}` : 'Details'}
            placement="right"
            width={720}
            onClose={closeDrawer}
            open={drawerVisible}
            bodyStyle={{ padding: 24 }}
            footer={(
              <div style={{ textAlign: 'right' }}>
                <Button onClick={closeDrawer} style={{ marginRight: 8 }}>Close</Button>
                <Button type="primary" onClick={() => { closeDrawer(); navigate(`/pokemon/${selectedPokemon?.id}`); }}>Open Full Page</Button>
              </div>
            )}
          >
            {selectedPokemon ? (
              <div>
                <Row gutter={[24, 24]} align="top">
                  <Col xs={24} md={10}>
                    <Card bodyStyle={{ padding: 12 }} bordered={false} style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
                      <Image
                        src={selectedPokemon.sprites?.other?.['official-artwork']?.front_default || selectedPokemon.sprites?.front_default}
                        alt={selectedPokemon.name}
                        style={{ width: '100%', objectFit: 'contain' }}
                        preview={{ src: selectedPokemon.sprites?.other?.['official-artwork']?.front_default }}
                      />
                    </Card>
                    <div style={{ marginTop: 12 }}>
                      {selectedPokemon.types.map((t) => (
                          <Tag key={t.type.name} color="#f0f0f0" style={{ textTransform: 'capitalize', marginBottom: 8, marginRight: 6, color: '#000' }}>{t.type.name}</Tag>
                        ))}
                    </div>
                  </Col>

                  <Col xs={24} md={14}>
                    <div style={{ marginBottom: 12 }}>
                      <h3 style={{ margin: 0, marginBottom: 8, fontSize: 16, borderBottom: '1px solid #f0f0f0', paddingBottom: 8 }}>Overview</h3>
                      <div style={{ paddingTop: 8 }}>
                        <p style={{ marginBottom: 6 }}><strong>Height:</strong> {selectedPokemon.height / 10} m</p>
                        <p style={{ marginBottom: 6 }}><strong>Weight:</strong> {selectedPokemon.weight / 10} kg</p>
                        <p style={{ marginBottom: 6 }}><strong>Base exp:</strong> {selectedPokemon.base_experience}</p>
                      </div>
                    </div>

                    <div style={{ marginBottom: 12 }}>
                      <h3 style={{ margin: 0, marginBottom: 8, fontSize: 16, borderBottom: '1px solid #f0f0f0', paddingBottom: 8 }}>Abilities</h3>
                      <div style={{ paddingTop: 8 }}>
                        {selectedPokemon.abilities.map(a => (
                          <Tag key={a.ability.name} style={{ textTransform: 'capitalize', marginBottom: 8, marginRight: 6 }}>{a.ability.name}{a.is_hidden ? ' (Hidden)' : ''}</Tag>
                        ))}
                      </div>
                    </div>

                    <div style={{ marginBottom: 12 }}>
                      <h3 style={{ margin: 0, marginBottom: 8, fontSize: 16, borderBottom: '1px solid #f0f0f0', paddingBottom: 8 }}>Stats</h3>
                      <div style={{ paddingTop: 8 }}>
                        {selectedPokemon.stats.map(stat => (
                          <div key={stat.stat.name} style={{ marginBottom: 12 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                              <div style={{ textTransform: 'capitalize' }}>{stat.stat.name}</div>
                              <div style={{ fontWeight: 600 }}>{stat.base_stat}</div>
                            </div>
                            <Progress percent={Math.round((stat.base_stat / 255) * 100)} showInfo={false} strokeColor={stat.base_stat > 100 ? '#52c41a' : '#1890ff'} />
                          </div>
                        ))}
                      </div>
                    </div>
                  </Col>
                </Row>

                <div style={{ marginTop: 18 }}>
                  <h3 style={{ margin: 0, marginBottom: 8, fontSize: 16, borderBottom: '1px solid #f0f0f0', paddingBottom: 8 }}>Moves (sample)</h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
                    {selectedPokemon.moves.slice(0, 12).map(m => (
                      <Tag key={m.move.name} style={{ textTransform: 'capitalize' }}>{m.move.name.replace('-', ' ')}</Tag>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </Drawer>
        </>
      )}
    </div>
  );
};

export default Servicepage;
