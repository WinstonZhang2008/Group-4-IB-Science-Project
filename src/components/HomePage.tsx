import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface HomePageProps {
  onNavigate: (page: string) => void;
}

const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Mars Agriculture Project</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Exploring the potential of growing plants in Martian soil for sustainable food production
          Made by Jahaan, Patrick, Rohan and Roneet
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle>Soil Suitability Checker</CardTitle>
            <CardDescription>
              Analyze soil parameters and get crop recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Input your soil parameters (pH, nitrogen, phosphorus, potassium, and moisture) to receive personalized crop recommendations
              optimized for Martian growing conditions.
            </p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => onNavigate('checker')} className="w-full">
              Check Soil Suitability
            </Button>
          </CardFooter>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle>Soil Data Visualizer</CardTitle>
            <CardDescription>
              Visualize soil parameters against optimal ranges
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              See how your soil parameters compare to optimal growing conditions with interactive charts and color-coded
              indicators to identify areas for improvement.
            </p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => onNavigate('visualizer')} className="w-full">
              Visualize Soil Data
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="mt-12 p-6 bg-muted rounded-lg">
        <h2 className="text-2xl font-bold mb-4">About This Project</h2>
        <p className="mb-4">
          This application was developed as part of an IB Computer Science project focused on the challenges of
          growing plants in Martian soil. The data used is based on current scientific understanding of
          Martian soil composition and plant growth requirements.
        </p>
        <p>
          Use the tools above to explore how different soil parameters affect crop suitability and to visualize
          the relationship between your soil samples and optimal growing conditions.
        </p>
      </div>
    </div>
  );
};

export default HomePage;