import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Table, Input, message, Spin } from 'antd';

const { Search } = Input;

const Servicepage = () => {

  const [pokemonList, setPokemonList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
  });

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

  // Table columns definition
  const columns = [
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
        <Spin tip="Loading..." size="large" />
      ) : (
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          pagination={pagination}
          onChange={handleTableChange}
        />
      )}
    </div>
  );
};

export default Servicepage;
