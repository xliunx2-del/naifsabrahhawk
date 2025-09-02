-- Create tables for food prediction data storage

-- Table for storing food prediction sequences
CREATE TABLE IF NOT EXISTS public.food_sequences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sequence_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for storing prediction results
CREATE TABLE IF NOT EXISTS public.prediction_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  selected_food TEXT NOT NULL,
  predictions JSONB NOT NULL,
  accuracy DECIMAL(5,4),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for storing AI model learning data
CREATE TABLE IF NOT EXISTS public.ai_learning_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pattern_data JSONB NOT NULL,
  confidence_scores JSONB NOT NULL,
  model_accuracy DECIMAL(5,4),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS) - public access for this demo
ALTER TABLE public.food_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prediction_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_learning_data ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (no authentication required)
CREATE POLICY "Allow public access to food_sequences" ON public.food_sequences FOR ALL USING (true);
CREATE POLICY "Allow public access to prediction_results" ON public.prediction_results FOR ALL USING (true);
CREATE POLICY "Allow public access to ai_learning_data" ON public.ai_learning_data FOR ALL USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_food_sequences_created_at ON public.food_sequences(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_prediction_results_created_at ON public.prediction_results(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_learning_data_updated_at ON public.ai_learning_data(updated_at DESC);
