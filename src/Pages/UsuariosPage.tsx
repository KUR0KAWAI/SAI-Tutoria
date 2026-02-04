import { useState, useEffect } from 'react';
import { usuariosService, type Usuario } from '../services/usuariosService';
import { profesoresService } from '../services/profesoresService';
import { rolesService, type RoleDto } from '../services/rolesService';
import type { ProfesorDto } from '../models/entities';
import { type RoleValue } from '../core/roles';
import './UsuariosPage.css';

const UsuariosPage = () => {
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [profesores, setProfesores] = useState<ProfesorDto[]>([]);
    const [roles, setRoles] = useState<RoleDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showPassword, setShowPassword] = useState(false);

    // Form State
    const initialFormState = {
        id: '',
        username: '',
        password: '',
        role: '' as RoleValue,
        roleId: '', // Added roleId for backend compatibility
        profesorId: ''
    };
    const [formData, setFormData] = useState(initialFormState);
    const [isEditing, setIsEditing] = useState(false);

    const fetchUsers = async () => {
        try {
            const config = { headers: { 'X-Source-Component': 'UsuariosPage' } };
            const usersData = await usuariosService.getAll(config);
            setUsuarios(usersData);
        } catch (error) {
            console.error('[UsuariosPage] Error refreshing users:', error);
        }
    };

    useEffect(() => {
        let isMounted = true;

        const loadData = async () => {
            if (!isMounted) return;

            try {
                const config = { headers: { 'X-Source-Component': 'UsuariosPage' } };
                console.log('%c[UsuariosPage] Mounting - Requesting Users and Teachers...', 'color: #f59e0b; font-weight: bold');

                // Load initial data: Users, Teachers, Roles
                const [usersResult, teachersResult, rolesResult] = await Promise.allSettled([
                    usuariosService.getAll(config),
                    profesoresService.getAll(config),
                    rolesService.getAll(config)
                ]);

                if (!isMounted) return;

                // Handle Users
                if (usersResult.status === 'fulfilled') {
                    setUsuarios(usersResult.value);
                } else {
                    console.error('[UsuariosPage] Failed to load users:', usersResult.reason);
                }

                // Handle Teachers
                if (teachersResult.status === 'fulfilled') {
                    setProfesores(teachersResult.value);
                } else {
                    console.error('[UsuariosPage] Failed to load teachers:', teachersResult.reason);
                }

                // Handle Roles
                if (rolesResult.status === 'fulfilled') {
                    setRoles(rolesResult.value);
                } else {
                    console.warn('[UsuariosPage] Failed to load roles, using fallback:', rolesResult.reason);
                    setRoles([
                        { id: '1', nombre: 'Docente' },
                        { id: '2', nombre: 'Coordinador' },
                        { id: '3', nombre: 'Administrador' }
                    ]);
                }
            } catch (error) {
                console.error('[UsuariosPage] Critical error loading data:', error);
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        loadData();

        return () => {
            isMounted = false;
        };
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        if (name === 'role') {
            // Value is now the role ID (e.g. "1")
            const selectedRole = roles.find(r => String(r.id) === value);
            setFormData(prev => ({
                ...prev,
                roleId: value, // Store the ID directly
                role: selectedRole ? selectedRole.nombre as RoleValue : '' as RoleValue
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.username || (!isEditing && !formData.password)) {
            alert('Atención: Por favor complete los campos obligatorios');
            return;
        }

        try {
            const profesor = profesores.find(p => p.id === formData.profesorId);
            const profesorNombre = profesor ? `${profesor.nombres} ${profesor.apellidos}` : undefined;

            const userData = {
                username: formData.username,
                password: formData.password,
                role: formData.role,
                roleId: formData.roleId, // Add roleId here
                profesorId: formData.profesorId,
                profesorNombre
            };

            if (isEditing && formData.id) {
                await usuariosService.update(formData.id, userData);
                alert('Usuario actualizado correctamente');
            } else {
                await usuariosService.create(userData);
                alert('Usuario creado correctamente');
            }

            // Refresh the user list from API
            await fetchUsers();
            resetForm();
        } catch (error) {
            console.error(error);
            alert('Error al guardar el usuario');
        }
    };

    const handleDelete = async (id: string) => {
        const confirmDelete = window.confirm('¿Estás seguro de que deseas eliminar este usuario? No se puede deshacer.');

        if (confirmDelete) {
            try {
                await usuariosService.delete(id);
                setUsuarios(prev => prev.filter(u => u.id !== id));
            } catch (error) {
                console.error(error);
                alert('Error: No se pudo eliminar el usuario');
            }
        }
    };

    const handleEdit = (user: Usuario) => {
        setFormData({
            id: user.id,
            username: user.username,
            password: '', // Don't show password on edit
            role: user.role as RoleValue,
            roleId: user.roleId ? String(user.roleId) : '', // Ensure we capture the roleId
            profesorId: user.profesorId || ''
        });
        setIsEditing(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const resetForm = () => {
        setFormData(initialFormState);
        setIsEditing(false);
    };

    if (isLoading) return <div className="loading-spinner">Cargando...</div>; // Or use LoadingScreen

    return (
        <div className="usuarios-page">
            <header className="page-header">
                <h1>Gestión de Usuarios</h1>
            </header>

            {/* Form Section (Top) */}
            <div className="card-panel">
                <div className="card-header">
                    <h2>
                        <i className={`bi bi-${isEditing ? 'pencil-square' : 'person-plus-fill'}`}></i>
                        {isEditing ? 'Editar Usuario' : 'Nuevo Usuario'}
                    </h2>
                </div>

                <form onSubmit={handleSubmit} className="user-form">
                    <div className="form-grid">
                        <div className="form-group">
                            <label htmlFor="username">Nombre de Usuario</label>
                            <div className="input-wrapper">
                                <span className="input-icon">
                                    <i className="bi bi-person"></i>
                                </span>
                                <input
                                    type="text"
                                    id="username"
                                    name="username"
                                    className="form-input"
                                    placeholder="ej. jperez"
                                    value={formData.username}
                                    onChange={handleInputChange}
                                    required
                                    autoComplete="username"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Contraseña {isEditing && '(Dejar en blanco para mantener)'}</label>
                            <div className="input-wrapper">
                                <span className="input-icon">
                                    <i className="bi bi-lock"></i>
                                </span>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    name="password"
                                    className="form-input"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    required={!isEditing}
                                    disabled={isEditing}
                                    autoComplete="new-password"
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                    title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                                >
                                    <i className={`bi bi-eye${showPassword ? '-slash' : ''}`}></i>
                                </button>
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="role">Rol de Usuario</label>
                            <div className="input-wrapper">
                                <span className="input-icon">
                                    <i className="bi bi-shield-lock"></i>
                                </span>
                                <select
                                    id="role"
                                    name="role"
                                    className="form-input select-input"
                                    value={formData.roleId} // Bind to roleId
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">-- Seleccionar Rol --</option>
                                    {roles.map(role => (
                                        <option key={role.id} value={role.id}>{role.nombre}</option> // Use ID as value
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="profesorId">Profesor Asociado</label>
                            <div className="input-wrapper">
                                <span className="input-icon">
                                    <i className="bi bi-person-badge"></i>
                                </span>
                                <select
                                    id="profesorId"
                                    name="profesorId"
                                    className="form-input select-input"
                                    value={formData.profesorId}
                                    onChange={handleInputChange}
                                    disabled={isEditing}
                                >
                                    <option value="">-- Seleccionar Profesor --</option>
                                    {profesores && profesores.length > 0 ? (
                                        profesores.map((profesor) => (
                                            <option key={profesor.id} value={profesor.id}>
                                                {profesor.nombres || 'Sin nombre'}
                                            </option>
                                        ))
                                    ) : (
                                        <option disabled>Cargando profesores...</option>
                                    )}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="form-actions">
                        {isEditing && (
                            <button type="button" className="btn btn-secondary" onClick={resetForm}>
                                Cancelar
                            </button>
                        )}
                        <button type="submit" className="btn btn-primary">
                            <i className="bi bi-save"></i>
                            {isEditing ? 'Actualizar Usuario' : 'Guardar Usuario'}
                        </button>
                    </div>
                </form>
            </div>

            {/* List Section (Bottom) */}
            <div className="card-panel">
                <div className="card-header">
                    <h2>
                        <i className="bi bi-table"></i>
                        Lista de Usuarios
                    </h2>
                </div>

                <div className="table-container">
                    <table className="users-table">
                        <thead>
                            <tr>
                                <th>Usuario</th>
                                <th>Rol</th>
                                <th>Profesor Asociado</th>
                                <th style={{ textAlign: 'center' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {usuarios.length === 0 ? (
                                <tr>
                                    <td colSpan={4} style={{ textAlign: 'center', padding: '30px' }}>
                                        No hay usuarios registrados
                                    </td>
                                </tr>
                            ) : (
                                usuarios.map(user => (
                                    <tr key={user.id}>
                                        <td>
                                            <div style={{ fontWeight: 500 }}>{user.username}</div>
                                        </td>
                                        <td>
                                            <span className={`role-badge ${roles.find(r => r.id == user.roleId)?.nombre.toLowerCase() || 'docente'}`}>
                                                {roles.find(r => r.id == user.roleId)?.nombre || user.role}
                                            </span>
                                        </td>
                                        <td>
                                            {user.profesorNombre || '-'}
                                        </td>
                                        <td>
                                            <div className="action-buttons" style={{ justifyContent: 'center' }}>
                                                <button
                                                    className="btn-icon btn-edit"
                                                    onClick={() => handleEdit(user)}
                                                    title="Editar"
                                                >
                                                    <i className="bi bi-pencil"></i>
                                                </button>
                                                <button
                                                    className="btn-icon btn-delete"
                                                    onClick={() => handleDelete(user.id)}
                                                    title="Eliminar"
                                                >
                                                    <i className="bi bi-trash"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default UsuariosPage;
