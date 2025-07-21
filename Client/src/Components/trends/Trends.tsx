// @ts-nocheck
import React, { useEffect, useState } from 'react';
import axios from 'axios';

import CustomTable from './CustomTable';

interface Recommendation {
    name: string;
    ratings: number;
    sold_in_last_month: number;
    BSR_classificationRanks_rank: number;
    score: number;
    link: string;
    image: string; // Added image to the interface
}

interface TopProduct {
    name: string;
    main_category: string;
    sub_category?: string;
    BSR_classificationRanks_rank?: number;
    BSR_displayGroupRanks_rank?: number;
    link: string;
    image: string; // Added image to the interface
    ratings?: number;
    sold_in_last_month?: number;
    score?: number;
}

interface ProcessedResult {
    top5_recommendations: Recommendation[];
    top_products_main_category: TopProduct[];
    top_products_sub_category: TopProduct[];
}

const ResultsComponent: React.FC = () => {
    const [results, setResults] = useState<ProcessedResult | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchResults = async () => {
            try {
              const token = localStorage.getItem('token'); // retrieve from storage
                const response = await axios.get<ProcessedResult>('http://localhost:3000/results',{
                    headers: {
                      Authorization: `Bearer ${token}`,
                    },
                  });
                setResults(response.data);
            } catch (err) {
                console.error('Error fetching results:', err);
                setError('Error fetching results: ' + (err as Error).message);
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, []);

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    if (error) {
        return <div className="error">{error}</div>;
    }
    const top5Columns = ['Image', 'Name', 'Ratings', 'Sold in Last Month', 'BSR Classification Rank', 'Score'];
    const mainCategoryColumns = ['Image', 'Name', 'Main Category', 'BSR Classification Rank'];
    const subCategoryColumns = ['Image', 'Name', 'Main Category', 'Sub Category', 'BSR Display Group Rank'];
  
    return (
        <div className="container mt-1 amazon-container">
          <h1 style={{ textAlign:'center', fontSize:'4em', fontFamily:'Georgia'}}>Market Trends</h1>
    
          {/* Top 5 Recommendations */}
          <CustomTable
            tableTitle="Top 5 Recommendations"
            columns={top5Columns}
            data={results?.top5_recommendations || []}
          />
    
          {/* Top Products - Main Category */}
          <CustomTable
            tableTitle="Top Products - Main Category"
            columns={mainCategoryColumns}
            data={results?.top_products_main_category || []}
          />
    
          {/* Top Products - Sub Category */}
          <CustomTable
            tableTitle="Top Products - Sub Category"
            columns={subCategoryColumns}
            data={results?.top_products_sub_category || []}
          />
        </div>
      );
};

export default ResultsComponent;
