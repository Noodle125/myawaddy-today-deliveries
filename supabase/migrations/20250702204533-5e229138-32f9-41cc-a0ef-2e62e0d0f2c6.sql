-- Assign admin role to the current admin user
INSERT INTO public.user_roles (user_id, role)
VALUES ('f5da23c3-64ec-45cd-ac81-954c1e990b7f', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- Also add the other admin email if needed
INSERT INTO public.user_roles (user_id, role)
VALUES ('c7cdbc87-fb3e-47c8-a0c7-656d68650c1d', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;