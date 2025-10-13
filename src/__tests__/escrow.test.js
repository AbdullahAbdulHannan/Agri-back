import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { QueryClient, QueryClientProvider } from 'react-query';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { AuthProvider } from '../context/AuthContext';
import MyOrders from '../pages/MyOrders';
import { orderService } from '../services/orderService';

// Mock API responses
const mockOrders = [
  {
    _id: 'order123',
    status: 'processing',
    paymentStatus: 'held_in_escrow',
    totalAmount: 99.99,
    createdAt: new Date().toISOString(),
    items: [
      { _id: 'item1', name: 'Test Product', price: 99.99, quantity: 1 }
    ],
    escrowDetails: {
      status: 'held_in_escrow',
      releaseDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      disputeRaised: false
    },
    shippingAddress: {
      street: '123 Test St',
      city: 'Testville',
      state: 'TS',
      postalCode: '12345',
      country: 'Testland'
    }
  }
];

const server = setupServer(
  rest.get('/api/orders/my-orders', (req, res, ctx) => {
    return res(ctx.json({ orders: mockOrders }));
  }),
  
  rest.post('/api/orders/escrow/release', (req, res, ctx) => {
    return res(ctx.json({ 
      success: true, 
      order: { 
        ...mockOrders[0], 
        paymentStatus: 'released',
        escrowDetails: { ...mockOrders[0].escrowDetails, status: 'released' }
      } 
    }));
  }),
  
  rest.post('/api/orders/escrow/dispute', (req, res, ctx) => {
    return res(ctx.json({ 
      success: true, 
      order: { 
        ...mockOrders[0], 
        paymentStatus: 'disputed',
        escrowDetails: { 
          ...mockOrders[0].escrowDetails, 
          status: 'disputed',
          disputeRaised: true,
          disputeReason: req.body.reason
        } 
      } 
    }));
  })
);

// Mock the orderService
jest.mock('../services/orderService');

const theme = createTheme();
const queryClient = new QueryClient();

const renderWithProviders = (ui) => {
  return render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <BrowserRouter>
          <AuthProvider>
            {ui}
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

describe('Escrow Flow', () => {
  beforeAll(() => server.listen());
  afterEach(() => {
    server.resetHandlers();
    jest.clearAllMocks();
  });
  afterAll(() => server.close());

  beforeEach(() => {
    // Mock successful authentication
    jest.spyOn(require('../context/AuthContext'), 'useAuth').mockImplementation(() => ({
      isAuthenticated: true,
      user: { _id: 'user123', role: 'buyer' },
      login: jest.fn(),
      logout: jest.fn(),
    }));
    
    // Mock order service methods
    orderService.getUserOrders.mockResolvedValue({ data: { orders: mockOrders } });
    orderService.releaseEscrowFunds.mockResolvedValue({ 
      data: { 
        order: {
          ...mockOrders[0],
          paymentStatus: 'released',
          escrowDetails: { ...mockOrders[0].escrowDetails, status: 'released' }
        } 
      } 
    });
    orderService.raiseDispute.mockResolvedValue({ 
      data: { 
        order: {
          ...mockOrders[0],
          paymentStatus: 'disputed',
          escrowDetails: { 
            ...mockOrders[0].escrowDetails, 
            status: 'disputed',
            disputeRaised: true,
            disputeReason: 'Test reason'
          }
        } 
      } 
    });
  });

  test('displays escrow status for orders', async () => {
    renderWithProviders(<MyOrders />);
    
    // Check if order is displayed with escrow status
    expect(await screen.findByText(/Order #ORDER123/i)).toBeInTheDocument();
    expect(screen.getByText(/Held In Escrow/i)).toBeInTheDocument();
    expect(screen.getByText(/Escrow/i)).toBeInTheDocument();
    
    // Check if escrow details are shown
    expect(screen.getByText(/Funds held in escrow/i)).toBeInTheDocument();
  });

  test('allows releasing escrow funds', async () => {
    renderWithProviders(<MyOrders />);
    
    // Wait for orders to load
    await screen.findByText(/Order #ORDER123/i);
    
    // Click release funds button
    const releaseButton = screen.getByRole('button', { name: /release funds early/i });
    fireEvent.click(releaseButton);
    
    // Check if order service was called
    await waitFor(() => {
      expect(orderService.releaseEscrowFunds).toHaveBeenCalledWith('order123');
    });
    
    // Check if UI updates to show released status
    expect(await screen.findByText(/Funds released/i)).toBeInTheDocument();
  });

  test('allows raising a dispute', async () => {
    renderWithProviders(<MyOrders />);
    
    // Wait for orders to load
    await screen.findByText(/Order #ORDER123/i);
    
    // Click raise dispute button
    const disputeButton = screen.getByRole('button', { name: /raise dispute/i });
    fireEvent.click(disputeButton);
    
    // Fill out dispute form
    const reasonSelect = await screen.findByLabelText(/reason for dispute/i);
    const descriptionInput = screen.getByLabelText(/additional details/i);
    const submitButton = screen.getByRole('button', { name: /submit dispute/i });
    
    fireEvent.mouseDown(reasonSelect);
    const reasonOption = await screen.findByText(/Item not as described/i);
    fireEvent.click(reasonOption);
    
    fireEvent.change(descriptionInput, { target: { value: 'Test dispute description' } });
    fireEvent.click(submitButton);
    
    // Check if order service was called with correct data
    await waitFor(() => {
      expect(orderService.raiseDispute).toHaveBeenCalledWith(
        'order123',
        'Item not as described',
        'Test dispute description'
      );
    });
    
    // Check if UI updates to show dispute status
    expect(await screen.findByText(/Dispute Raised/i)).toBeInTheDocument();
  });

  test('displays escrow release countdown', async () => {
    renderWithProviders(<MyOrders />);
    
    // Wait for orders to load
    await screen.findByText(/Order #ORDER123/i);
    
    // Check if countdown is displayed
    expect(screen.getByText(/Automatic release in/i)).toBeInTheDocument();
    expect(screen.getByText(/days/i)).toBeInTheDocument();
  });
});
