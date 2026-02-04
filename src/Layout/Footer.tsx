import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-content">
                <p>&copy; {new Date().getFullYear()} Universidad Técnica de Babahoyo - Sistema Académico Integral (SAI-UTB)</p>
                <p>Todos los derechos reservados.</p>
            </div>
        </footer>
    );
};

export default Footer;
